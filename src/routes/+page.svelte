<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";

  // フォーム設定
  const prefix_pattern = ["fix", "feat", "chore", "update", "add", "docs"].map((v) => `${v}:`);
  const dummy_questions = [
    "バグ: ドロップダウンメニューの選択が正しく反映されない - ユーザーの選択が正しく表示されないまたは保存されない場合の問題。",
    "機能追加: レスポンシブデザインの改善 - モバイルデバイスやタブレットでの表示を改善するための要求。",
    "バグ: ログイン後のリダイレクトが機能しない - ユーザーがログインした後に正しいページにリダイレクトされない問題。",
    "パフォーマンス: ページの読み込み速度の最適化 - 特定のページが遅くなることに対する懸念。",
    "テスト: ユニットテストのカバレッジを拡大する - コードの一部がテストでカバーされていないこと。",
    "バグ: フォームバリデーションが不十分 - ユーザーが無効な入力を行ってもエラーメッセージが表示されない問題。",
    "リファクタリング: コンポーネントの分割 - 一部の大きすぎるコンポーネントをより管理しやすい小さなコンポーネントに分割する必要性。",
    "機能追加: ダークモードの実装 - ダークモードオプションの追加要求。",
    "セキュリティ: CSRF対策の実装 - セキュリティ対策として、Cross-Site Request Forgery（CSRF）対策の実装が必要。",
    "ドキュメンテーション: コードコメントの追加と更新 - コードの一部が十分に説明されていない、またはコメントが古くなっているという問題。",
  ];

  // フォーム初期値
  let question = dummy_questions[Math.floor(Math.random() * dummy_questions.length)];
  let prefix_list: string[] = [];
  let answers = ["ここに結果が表示されます。"];
  let isButtonDisabled = false;

  // API通信
  let promise: Promise<string[]> = Promise.resolve(answers);
  const chat = async (): Promise<string[]> => {
    const result = await axios.post("/api/chat", {
      params: {
        question,
        prefix_list,
      },
    });
    if (result.status === 200) {
      return result.data?.answers;
    }
    throw new Error("API Error");
  };
  const submit = async () => {
    isButtonDisabled = true;
    const response = await chat();
    isButtonDisabled = false;
    return response;
  };

  // マウント時に実行
  onMount(() => {
    // prefixの設定をローカルストレージから取得
    const prefix_settings = localStorage.getItem("prefix_settings");
    if (prefix_settings) {
      prefix_list = JSON.parse(prefix_settings).data.split(",") || [...prefix_pattern];
    } else {
      prefix_list = [...prefix_pattern];
    }
  });

  // ハンドリング
  const handleChange = () => {
    // prefixの設定をローカルストレージに保存
    localStorage.setItem("prefix_settings", JSON.stringify({ data: prefix_list.join(",") }));
  };
  const handleSubmit = async () => {
    promise = submit();
  };
</script>

<div class="container">
  <h1 class="mt-5">Good Git Comment Generator</h1>
  <form class="mt-5">
    <div class="form-group">
      <label for="question">接頭辞候補</label>
      <div class="mt-2">
        <div class="row">
          {#each prefix_pattern as prefix, i}
            <div class="col-1 mx-2 form-check form-switch">
              <input class="form-check-input" bind:group={prefix_list} value={prefix} name="prefix_group" type="checkbox" id={`prefix_${i}`} on:change={handleChange} />
              <label class="form-check-label" for={`prefix_${i}`}>{prefix}</label>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="form-group mt-4">
      <label for="question">実装内容</label>
      <div class="mt-2">
        <textarea class="form-control" id="question" rows="5" bind:value={question} />
      </div>
    </div>
    <button type="button" class="btn btn-primary btn-lg mt-4" disabled={isButtonDisabled} on:click|preventDefault={handleSubmit}>生成</button>
    <div class="form-group　my-5">
      <label for="answer">結果</label>
      <div class="mt-2">
        {#await promise}
          <input type="text" class="form-control" id="answer" value="通信中..." disabled />
        {:then answers}
          {#each answers as answer, i}
            <input type="text" class="form-control" class:mt-2={i !== 0} id="answer" value={answer} />
          {/each}
        {/await}
      </div>
    </div>
  </form>
</div>
