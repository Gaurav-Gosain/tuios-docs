/**
 * Reads the submissions discussion through the GitHub GraphQL API. The
 * discussion is public, so the workflow's own GITHUB_TOKEN can read it.
 */

import type { DiscussionComment } from "./filter";

const OWNER = "Gaurav-Gosain";
const REPO = "tuios";
export const DISCUSSION_NUMBER = 849;

const COMMENTS = `
query($owner: String!, $repo: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repo) {
    discussion(number: $number) {
      comments(first: 50, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          databaseId
          body
          createdAt
          lastEditedAt
          isMinimized
          author { login }
          reactions(content: ROCKET, first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { createdAt user { login } }
          }
        }
      }
    }
  }
}`;

const MORE_ROCKETS = `
query($id: ID!, $after: String) {
  node(id: $id) {
    ... on DiscussionComment {
      reactions(content: ROCKET, first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { createdAt user { login } }
      }
    }
  }
}`;

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type Reactions = {
  pageInfo: PageInfo;
  nodes: { createdAt: string; user: { login: string } | null }[];
};
type CommentNode = {
  id: string;
  databaseId: number;
  body: string;
  createdAt: string;
  lastEditedAt: string | null;
  isMinimized: boolean;
  author: { login: string } | null;
  reactions: Reactions;
};

async function graphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "tuios-docs-gallery-sync",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (!response.ok || json.errors?.length || !json.data) {
    const why = json.errors?.map((e) => e.message).join("; ");
    throw new Error(
      `GitHub GraphQL answered ${response.status}${why ? `: ${why}` : ""}`,
    );
  }
  return json.data;
}

/** Every top-level comment on the discussion, with its rocket reactions. */
export async function fetchComments(
  token: string,
): Promise<DiscussionComment[]> {
  const out: DiscussionComment[] = [];
  let after: string | null = null;
  for (let page = 0; page < 100; page++) {
    const data: {
      repository: {
        discussion: {
          comments: { pageInfo: PageInfo; nodes: CommentNode[] };
        } | null;
      };
    } = await graphql(token, COMMENTS, {
      owner: OWNER,
      repo: REPO,
      number: DISCUSSION_NUMBER,
      after,
    });
    const discussion = data.repository.discussion;
    if (!discussion) {
      throw new Error(`discussion #${DISCUSSION_NUMBER} was not found`);
    }
    for (const node of discussion.comments.nodes) {
      const rockets = [...node.reactions.nodes];
      let info = node.reactions.pageInfo;
      for (let more = 0; info.hasNextPage && more < 20; more++) {
        const extra: { node: { reactions: Reactions } } = await graphql(
          token,
          MORE_ROCKETS,
          { id: node.id, after: info.endCursor },
        );
        rockets.push(...extra.node.reactions.nodes);
        info = extra.node.reactions.pageInfo;
      }
      out.push({
        id: String(node.databaseId),
        author: node.author?.login ?? null,
        body: node.body,
        createdAt: node.createdAt,
        lastEditedAt: node.lastEditedAt,
        isMinimized: node.isMinimized,
        rockets: rockets.map((r) => ({
          login: r.user?.login ?? null,
          createdAt: r.createdAt,
        })),
      });
    }
    if (!discussion.comments.pageInfo.hasNextPage) return out;
    after = discussion.comments.pageInfo.endCursor;
  }
  throw new Error("the discussion has more comments than the sync reads");
}
