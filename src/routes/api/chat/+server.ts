import { Configuration, OpenAIApi } from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import type { RequestHandler } from "../$types";

const debug = !true;

const chat = async ({ content }: { content: string }): Promise<string> => {
  if (debug) {
    // 3秒待つ
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // throw new Error("debug");
    return `feat: Implemented pagination for NEWS page list.\nchore: Cleaned up code related to NEWS page list pagination.\nupdate: Updated NEWS page list with pagination functionality.`;
  }
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content }],
  });
  return completion.data.choices[0]?.message?.content || "";
};

export const POST = (async ({ request }) => {
  const res = await request.json();
  const { question, prefix_comment, prefix_branch, type } = res.params;
  const max_answer = (() => {
    switch (type) {
      case "comment":
        return Math.max(prefix_comment.length * 3, 3);
      case "branch":
        return 3;
      default:
        return 3;
    }
  })();
  const content = (() => {
    switch (type) {
      case "comment":
        return [
          `次のような実装を行った。このプロジェクトはgitで管理を行なっており、この変更をcommitしたい。英語でgit commentを考えて。`,
          `接頭辞として ${prefix_comment.join(
            " "
          )} から順番に3つずつ出力して。(合計${max_answer}個)`,
          `出力形式はgit commentのみで接頭辞から必ず開始すること。接頭辞から開始しない回答は認めない。`,
          `クォーテーションなどで囲みなどは一切不要。`,
          `回答はそれぞれ\nで区切って。順番は接頭辞毎にグループ化して3つずつ表示して。`,
          `------------------------------`,
          `${question}`,
          `------------------------------`,
          `下記の回答例に従って回答して。`,
          `fix: Update image and resize for better viewing`,
          `fix: Replace image and adjust size for optimal display`,
          `fix: Refresh image and resize to improve visibility`,
          `docs: Update image and resize for better viewing`,
          `docs: Replace image and adjust size for optimal display`,
          `docs: Refresh image and resize to improve visibility`,
          `chore: Update image and resize for better viewing`,
          `chore: Replace image and adjust size for optimal display`,
          `chore: Refresh image and resize to improve visibility`,
        ].join("\n");
      case "branch":
        return [
          `次のような実装を行う。このプロジェクトはgitで管理を行なっており、作業をする際、新たにブランチを作成する。この作業ブランチの名前を英語で考えて。`,
          `回答は${max_answer}種類出力し、改行で区切って。`,
          !!prefix_branch ? `接頭辞として"${prefix_branch}"を使用して。` : "",
          `------------------------------`,
          `${question}`,
          `------------------------------`,
          `下記の回答例に従って回答して。`,
          `${
            !!prefix_branch ? prefix_branch + "/" : ""
          }update_type_label_format`,
          `${
            !!prefix_branch ? prefix_branch + "/" : "feature/"
          }fix_type_label_format`,
          `${
            !!prefix_branch ? prefix_branch + "/" : "docs/"
          }update_type_label_format`,
        ].join("\n");
      default:
        return "";
    }
  })();
  const response = await chat({ content });
  console.log({ max_answer, content, response });
  // 改行で区切られていることが期待されるため、配列で返す
  const temp = response.split("\n");
  const answers = new Array(max_answer).fill("").map((_, i) => temp[i] || "");
  const body = {
    question: question || "",
    answers,
  };
  return new Response(JSON.stringify(body));
}) satisfies RequestHandler;
