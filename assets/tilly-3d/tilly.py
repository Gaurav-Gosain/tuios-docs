"""Tilly in 3D, for the website: builds the model in Blender and exports a GLB.

Run it through build.sh, which also compresses the result:

    blender -b --factory-startup -P assets/tilly-3d/tilly.py -- <out.glb> [out.blend]

Tilly is the drawing in components/learn/tilly-figure.tsx turned into solids,
so the proportions below are that drawing's numbers (a 120 by 128 viewBox)
scaled by S. The shell, feet, screen, antennas and hands sit where the 2D
figure has them, and the colours are the same Catppuccin values.

The face is not modelled. The screen is one curved sheet named "Screen" with
UVs that run 0..1 across the drawing's screen rectangle, and the site draws
the face (panes, eyes, the >_ prompt) onto it at runtime so it can blink and
change mood.

The nodes the site animates are named: Body (bob, lean, look), AntennaL and
AntennaR (sway), HandL and HandR (wave), and FootL and FootR.
"""

import math
import os
import sys

import bmesh
import bpy

# One SVG pixel in Blender units. The shell is 86 px wide, 1.9 units here.
S = 1.9 / 86
# Ground is the bottom of the feet, y = 117 in the drawing.
GROUND = 117


def z_of(svg_y):
    return (GROUND - svg_y) * S


def lin(hexstr):
    """Hex sRGB to the linear RGBA that Blender colour sockets hold."""
    h = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


# The values in tilly-figure.tsx.
C = {
    "shell": "#cba6f7",   # Mauve
    "back": "#a987ea",
    "deep": "#8062cf",
    "screen": "#11111b",  # Crust
    "rod": "#7f849c",     # Overlay 1
    "ballA": "#f9e2af",   # Yellow
    "ballB": "#89dceb",   # Sky
}


# ------------------------------------------------------------------ materials

def material(name, color, rough=0.5, metal=0.0, coat=0.0, coat_rough=0.1,
             sheen=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if coat:
        p.inputs["Coat Weight"].default_value = coat
        p.inputs["Coat Roughness"].default_value = coat_rough
    if sheen:
        p.inputs["Sheen Weight"].default_value = sheen
        p.inputs["Sheen Tint"].default_value = (1.0, 0.93, 1.0, 1.0)
        p.inputs["Sheen Roughness"].default_value = 0.45
    if emit:
        p.inputs["Emission Color"].default_value = lin(emit)
        p.inputs["Emission Strength"].default_value = strength
    m.diffuse_color = lin(color)
    return m


# ---------------------------------------------------------------------- meshes

def rounded_rect(w, h, radius, per_corner=8, per_side=4):
    """Points and outward normals around a rounded rectangle in the XZ plane.

    Counter-clockwise seen from the front (-Y). Straight edges get per_side
    points so the cap rings stay close to square quads.
    """
    radius = min(radius, w / 2 - 1e-4, h / 2 - 1e-4)
    hw, hh = w / 2 - radius, h / 2 - radius
    corners = ((hw, hh, 0), (-hw, hh, 90), (-hw, -hh, 180), (hw, -hh, 270))
    pts = []
    for i, (cx, cz, start) in enumerate(corners):
        for k in range(per_corner + 1):
            a = math.radians(start + 90 * k / per_corner)
            n = (math.cos(a), math.sin(a))
            pts.append(((cx + radius * n[0], cz + radius * n[1]), n))
        # Straight edge to the next corner, without its end points.
        nx, nz, _ = corners[(i + 1) % 4]
        a_end = math.radians(start + 90)
        n = (math.cos(a_end), math.sin(a_end))
        p0 = (cx + radius * n[0], cz + radius * n[1])
        p1 = (nx + radius * n[0], nz + radius * n[1])
        for k in range(1, per_side):
            t = k / per_side
            pts.append(((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t), n))
    return pts


def mesh_object(name, verts, faces, mat, parent=None, uvs=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    for poly in me.polygons:
        poly.use_smooth = True
    if uvs is not None:
        layer = me.uv_layers.new(name="UVMap")
        for loop in me.loops:
            layer.data[loop.index].uv = uvs[loop.vertex_index]
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    me.materials.append(mat)
    if parent is not None:
        obj.parent = parent
    return obj


def ring_faces(faces, a, b, m):
    """Quads between two rings of m vertices starting at indices a and b."""
    for i in range(m):
        j = (i + 1) % m
        faces.append((a + i, a + j, b + j, b + i))


def pillow(name, w, h, d, radius, edge, mat, loc=(0, 0, 0), parent=None,
           front_bulge=0.0, back_bulge=0.0, rings=5, edge_steps=5,
           per_corner=8, per_side=4):
    """A rounded slab: a rounded-rectangle profile of width w and height h in
    XZ, depth d along Y, with its front and back rims rounded by `edge`.

    The caps are concentric rings, so there are no long fan triangles and the
    smooth normals stay clean. A bulge pushes a cap outward in the middle.
    """
    edge = min(edge, d / 2 - 1e-4)
    prof = rounded_rect(w - 2 * edge, h - 2 * edge, max(radius - edge, 1e-3),
                        per_corner, per_side)
    m = len(prof)
    verts, faces = [], []

    def cap(sign, bulge):
        # Center vertex, then rings out to the inset profile.
        y0 = sign * (d / 2)
        start = len(verts)
        verts.append((0.0, y0 + sign * bulge, 0.0))
        for k in range(1, rings + 1):
            f = k / rings
            for (px, pz), _n in prof:
                verts.append((px * f, y0 + sign * bulge * (1 - f * f), pz * f))
        return start

    front = cap(-1, front_bulge)
    # Fan around the front center, then quads between front rings.
    for i in range(m):
        j = (i + 1) % m
        faces.append((front, front + 1 + j, front + 1 + i))
    for k in range(rings - 1):
        a = front + 1 + k * m
        ring_faces(faces, a, a + m, m)

    # The rounded rim: quarter arc at the front, straight band, arc at the back.
    rim_rows = []
    for s in range(1, edge_steps + 1):
        phi = math.radians(90 * s / edge_steps)
        rim_rows.append((math.sin(phi), -(d / 2 - edge) - edge * math.cos(phi)))
    for s in range(1, 3):
        rim_rows.append((1.0, -(d / 2 - edge) + (d - 2 * edge) * s / 2))
    for s in range(1, edge_steps):
        phi = math.radians(90 - 90 * s / edge_steps)
        rim_rows.append((math.sin(phi), (d / 2 - edge) + edge * math.cos(phi)))

    prev = front + 1 + (rings - 1) * m
    for out, y in rim_rows:
        start = len(verts)
        for (px, pz), (nx, nz) in prof:
            verts.append((px + edge * out * nx, y, pz + edge * out * nz))
        ring_faces(faces, prev, start, m)
        prev = start

    # Back cap, from the outer ring inwards.
    y0 = d / 2
    for k in range(rings, 0, -1):
        f = k / rings
        start = len(verts)
        for (px, pz), _n in prof:
            verts.append((px * f, y0 + back_bulge * (1 - f * f), pz * f))
        ring_faces(faces, prev, start, m)
        prev = start
    center = len(verts)
    verts.append((0.0, y0 + back_bulge, 0.0))
    for i in range(m):
        j = (i + 1) % m
        faces.append((prev + i, prev + j, center))

    verts = [(x + loc[0], y + loc[1], z + loc[2]) for x, y, z in verts]
    obj = mesh_object(name, verts, faces, mat, parent)
    fix_normals(obj)
    return obj


def fix_normals(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()
    for poly in obj.data.polygons:
        poly.use_smooth = True


def glass(name, w, h, radius, bulge, mat, loc, parent, rings=10, per_corner=10,
          per_side=8):
    """The screen: one curved sheet facing -Y, with UVs 0..1 over w by h.

    v runs up the screen in Blender, and the glTF exporter flips it, so in
    three.js v = 0 is the top edge, the same way up as a canvas.
    """
    prof = rounded_rect(w, h, radius, per_corner, per_side)
    m = len(prof)
    verts, uvs, faces = [], [], []

    def add(x, z, f):
        # CRT curvature: highest in the middle, flat at the rim.
        verts.append((x, -bulge * (1 - f * f), z))
        uvs.append((x / w + 0.5, z / h + 0.5))

    add(0.0, 0.0, 0.0)
    for k in range(1, rings + 1):
        f = k / rings
        for (px, pz), _n in prof:
            add(px * f, pz * f, f)
    for i in range(m):
        j = (i + 1) % m
        faces.append((0, 1 + j, 1 + i))
    for k in range(rings - 1):
        a = 1 + k * m
        ring_faces(faces, a, a + m, m)
    verts = [(x + loc[0], y + loc[1], z + loc[2]) for x, y, z in verts]
    obj = mesh_object(name, verts, faces, mat, parent, uvs=uvs)
    # Face the camera: the fan above winds the other way.
    fix_normals(obj)
    front = sum(p.normal.y for p in obj.data.polygons)
    if front > 0:
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
        bm.to_mesh(obj.data)
        bm.free()
    return obj


def sphere(name, radii, loc, mat, parent=None, seg=32, rings=16):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    for v in bm.verts:
        v.co.x *= radii[0]
        v.co.y *= radii[1]
        v.co.z *= radii[2]
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    me.materials.append(mat)
    for poly in me.polygons:
        poly.use_smooth = True
    if parent is not None:
        obj.parent = parent
    return obj


def rod(name, radius, length, mat, parent, seg=12):
    """A capsule along +Z from the parent's origin."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=8, radius=radius)
    for v in bm.verts:
        if v.co.z > 0:
            v.co.z += length - 2 * radius
        v.co.z += radius
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    me.materials.append(mat)
    for poly in me.polygons:
        poly.use_smooth = True
    obj.parent = parent
    return obj


def empty(name, loc=(0, 0, 0), parent=None, rot=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = rot
    if parent is not None:
        obj.parent = parent
    return obj


def strip_uvs(obj):
    """Only the screen needs texture coordinates. The rest ship without."""
    if obj.type == "MESH" and obj.name != "Screen":
        while obj.data.uv_layers:
            obj.data.uv_layers.remove(obj.data.uv_layers[0])


# ----------------------------------------------------------------------- build

def build():
    shell_m = material("Shell", C["shell"], rough=0.42, coat=0.35, coat_rough=0.25,
                       sheen=0.35)
    back_m = material("Back", C["back"], rough=0.5, sheen=0.25)
    feet_m = material("Feet", C["deep"], rough=0.55, sheen=0.2)
    bezel_m = material("Bezel", C["screen"], rough=0.35)
    # The glass is dark and glossy. The site gives it the face as an emissive
    # texture, so the file has no emission and a failed texture stays dark.
    screen_m = material("Screen", C["screen"], rough=0.12, coat=1.0, coat_rough=0.04)
    rod_m = material("Rod", C["rod"], rough=0.35, metal=0.6)
    ball_a = material("TipA", C["ballA"], rough=0.3, emit=C["ballA"], strength=0.35)
    ball_b = material("TipB", C["ballB"], rough=0.3, emit=C["ballB"], strength=0.35)

    root = empty("Tilly")

    # Feet: rect x 33..53 and 67..87, y 103..117.
    for side, sx in (("L", -1), ("R", 1)):
        pillow(f"Foot{side}", 20 * S, 14 * S + 0.02, 0.58, 6 * S, 0.1, feet_m,
               loc=(sx * 17 * S, -0.04, z_of(110) + 0.01), parent=root,
               rings=3, per_corner=6, per_side=2)

    # Body pivot at the drawing's bob origin, (60, 108).
    body = empty("Body", loc=(0, 0, z_of(108)), parent=root)
    bz = z_of(108)

    # Shell: rect x 17..103, y 34..107, rx 22.
    depth = 1.3
    pillow("Shell", 86 * S, 73 * S, depth, 22 * S, 0.2, shell_m,
           loc=(0, 0, z_of(70.5) - bz), parent=body, back_bulge=0.06,
           rings=6, per_corner=10, per_side=6)
    # The tube at the back, the CRT the 2D drawing cannot show.
    pillow("Tube", 60 * S, 50 * S, 0.62, 16 * S, 0.16, back_m,
           loc=(0, depth / 2 + 0.18, z_of(72) - bz), parent=body, back_bulge=0.05,
           rings=4, per_corner=8, per_side=4)

    # Screen: rect x 26..94, y 44..96, rx 8, set into a dark bezel.
    sw, sh = 68 * S, 52 * S
    sz = z_of(70) - bz
    pillow("Bezel", sw + 0.07, sh + 0.07, 0.1, 9 * S, 0.035, bezel_m,
           loc=(0, -depth / 2 - 0.01, sz), parent=body,
           rings=3, per_corner=8, per_side=6)
    glass("Screen", sw, sh, 8 * S, 0.035, screen_m,
          loc=(0, -depth / 2 - 0.062, sz), parent=body)

    # Antennas: rods from (55,35) and (65,35) to (43,13) and (78,13).
    base_z = z_of(36) - bz
    sphere("AntennaBase", (13 * S, 0.2, 5.5 * S), (0, 0.08, base_z), back_m, body,
           seg=24, rings=12)
    for side, sx, tip in (("L", -1, ball_a), ("R", 1, ball_b)):
        ang = math.atan2(abs(43 - 55) if sx < 0 else abs(78 - 65), 35 - 13)
        piv = empty(f"Antenna{side}", loc=(sx * 5 * S, 0.08, base_z + 0.04),
                    parent=body, rot=(0, sx * ang, 0))
        length = math.hypot(12, 22) * S
        rod(f"Rod{side}", 1.5 * S, length, rod_m, piv)
        sphere(f"Tip{side}", (5.5 * S,) * 3, (0, 0, length + 3 * S), tip, piv,
               seg=20, rings=10)

    # Hands: ellipses at (13,76) and (107,76), rx 8, ry 10. The pivot is the
    # shoulder, so the wave swings the hand up and out.
    for side, sx in (("L", -1), ("R", 1)):
        piv = empty(f"Hand{side}", loc=(sx * 38 * S, 0.0, z_of(70) - bz), parent=body)
        sphere(f"Hand{side}Mesh", (8 * S, 0.19, 10 * S),
               (sx * 9 * S, 0.0, z_of(76) - z_of(70)), shell_m, piv, seg=24, rings=12)

    for obj in bpy.context.scene.objects:
        strip_uvs(obj)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = os.path.abspath(argv[0] if argv else "tilly-raw.glb")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build()
    if len(argv) > 1:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(argv[1]))
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=False,
    )
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
