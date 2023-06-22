<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";
  import "carbon-components-svelte/css/g80.css";
  import { Form, FormGroup, Checkbox, Button } from "carbon-components-svelte";
  import { CopyButton, TextInput, TextArea, TextInputSkeleton } from "carbon-components-svelte";
  import { RadioButtonGroup, RadioButton } from "carbon-components-svelte";
  import { InlineLoading } from "carbon-components-svelte";

  // フォーム設定
  const type_list = ["comment", "branch"];
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
  let type = type_list[0];
  let prefix_comment: string[] = [];
  let prefix_branch: string = "";
  let answers = ["ここに結果が表示されます。"];
  let isButtonDisabled = false;

  // API通信
  let promise: Promise<string[]> = Promise.resolve(answers);
  const chat = async (): Promise<string[]> => {
    const result = await axios.post("/api/chat", {
      params: {
        question,
        prefix_comment,
        prefix_branch,
        type,
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
    // 初期設定をローカルストレージから取得
    const form_config = localStorage.getItem("form_config");
    if (form_config && JSON.parse(form_config)) {
      const _form_config = JSON.parse(form_config);
      type = _form_config.type || type_list[0];
      prefix_comment = _form_config.prefix_comment || [];
      prefix_branch = _form_config.prefix_branch || "";
    }
  });

  // ハンドリング
  const handleChange = () => {
    // prefixの設定をローカルストレージに保存
    localStorage.setItem("form_config", JSON.stringify({ type, prefix_comment, prefix_branch }));
  };
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    promise = submit();
  };
</script>

<div class="container">
  <div class="container__inn">
    <h1>Git Guru Echo</h1>
    <Form class="form" on:submit={handleSubmit}>
      <FormGroup legendText="タイプ選択">
        <RadioButtonGroup bind:selected={type} on:change={handleChange}>
          {#each type_list as value}
            <RadioButton labelText={value} {value} />
          {/each}
        </RadioButtonGroup>
      </FormGroup>
      {#if type === "comment"}
        <FormGroup legendText="接頭辞候補" class="checkboxes">
          {#each prefix_pattern as prefix}
            <Checkbox class="checkbox" bind:group={prefix_comment} value={prefix} labelText={prefix} on:change={handleChange} />
          {/each}
        </FormGroup>
      {/if}
      {#if type === "branch"}
        <FormGroup legendText="接頭辞入力">
          <TextInput bind:value={prefix_branch} placeholder="feature/などの指定があれば入力" on:change={handleChange} />
        </FormGroup>
      {/if}
      <FormGroup legendText="実装内容">
        <TextArea bind:value={question} placeholder="実装内容を記入してください。" helperText="" />
      </FormGroup>
      <Button disabled={isButtonDisabled} type="submit">生成</Button>
    </Form>
    <Form class="result">
      <FormGroup legendText="結果">
        {#await promise}
          <TextInputSkeleton hideLabel />
          <InlineLoading description="通信中..." />
        {:then answers}
          <div class="answer">
            {#each answers as answer}
              <div class="answer-inn">
                <CopyButton text={answer} feedback="コピーしました。" />
                <TextInput value={answer} placeholder="" />
              </div>
            {/each}
          </div>
          <InlineLoading status="finished" description="Success" />
        {:catch error}
          <TextInput disabled />
          <InlineLoading status="error" description={error} />
        {/await}
      </FormGroup>
    </Form>
  </div>
</div>

<style global>
  .form {
    margin-top: 40px;
  }
  .checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .checkbox {
    margin-top: 0 !important;
    max-width: fit-content;
  }
  .result {
    margin-top: 40px;
  }
  .answer {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .answer-inn {
    display: flex;
    width: 100%;
    gap: 5px;
  }
</style>
