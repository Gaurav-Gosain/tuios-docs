/**
 * A small Mermaid mode for CodeMirror: the diagram keyword, comments,
 * strings, arrows and edge labels. Enough to read a diagram at a glance.
 */
import { StreamLanguage, type StringStream } from "@codemirror/language";

const HEADERS =
  /^(flowchart|graph|sequenceDiagram|stateDiagram(-v2)?|classDiagram|erDiagram|pie|mindmap|gantt|journey|gitGraph|timeline|quadrantChart|xychart-beta|sankey-beta|block-beta|C4Context|requirementDiagram|architecture-beta)\b/;

const KEYWORDS =
  /^(subgraph|end|direction|participant|actor|note|Note|over|left of|right of|loop|alt|else|opt|par|and|critical|break|rect|activate|deactivate|autonumber|class|classDef|style|linkStyle|click|state|title|section|dateFormat|axisFormat|excludes|includes|todayMarker|showData|accTitle|accDescr|TB|TD|BT|LR|RL|as)\b/;

const ARROW =
  /^(<?[-=.]{1,3}(>>|>|x|o|\))?|[<ox]?--[-.]?[>ox]?|\|\|--o\{|\}o--\|\||[|}{o]{1,2}--[|}{o]{1,2}|\*--|o--|<\|--|--\|>|\.\.>|\.\.\|>)/;

type State = { first: boolean };

export const mermaidLanguage = StreamLanguage.define<State>({
  name: "mermaid",
  startState: () => ({ first: true }),
  token(stream: StringStream, state: State) {
    if (stream.sol()) stream.eatSpace();
    if (stream.eatSpace()) return null;
    if (stream.match("%%")) {
      stream.skipToEnd();
      return "comment";
    }
    if (state.first && stream.match(HEADERS)) {
      state.first = false;
      return "keyword";
    }
    if (stream.match(/^"[^"]*"?/)) return "string";
    if (stream.match(/^\|[^|]*\|/)) return "string";
    if (stream.match(/^:.*/)) return "string";
    if (stream.match(KEYWORDS)) return "keyword";
    if (stream.match(ARROW)) return "operator";
    if (stream.match(/^[[\](){}>]+/)) return "bracket";
    if (stream.match(/^-?\d+(\.\d+)?/)) return "number";
    if (stream.match(/^[\p{L}\p{N}_]+/u)) {
      state.first = false;
      return "variableName";
    }
    stream.next();
    return null;
  },
  blankLine() {},
});
