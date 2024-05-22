<script lang="ts">
  import { dev as devMode } from "$app/environment";

  type Mode = "createRecipe" | "createItem" | "";

  let mode = "";

  let createRecipeItem1 = "";
  let createRecipeItem2 = "";
  let createRecipeOutput = "";

  let result = "";

  const createRecipe = async () => {
    result = await (
      await fetch("http://localhost:5173/api/edit/createRecipe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          item1Id: createRecipeItem1,
          item2Id: createRecipeItem2,
          outputItemId: createRecipeOutput,
        }),
      })
    ).text();
  };

  const unlockAllItems = async () => {
    let items = await (await fetch("http://localhost:5173/api/edit/getItemsList")).text()

    localStorage.setItem("unlockedRecipes", items);
  }
</script>

{#if devMode}
  <div class="wrapper">
    <button on:click={() => (mode = "createRecipe")}>Create/Edit Recipe</button>
    <button on:click={() => (mode = "createItem")}>New Item</button>
    <button on:click={unlockAllItems}>Unlock All Recipes</button>
  </div>
  <div class="mt-8 w-screen px-24">
    {#if mode === "createRecipe"}
      <div>
        <label for="item1">Item 1 ID</label>
        <input bind:value={createRecipeItem1} class="data-input" id="item1" />
      </div>
      <div>
        <label for="item2">Item 2 ID</label>
        <input bind:value={createRecipeItem2} class="data-input" id="item2" />
      </div>
      <div>
        <label for="item3">Output Item ID</label>
        <input bind:value={createRecipeOutput} class="data-input" id="item3" />
      </div>
      <div>
        <button class="mt-4 ml-4" on:click={createRecipe}>Create Item</button>
      </div>
    {:else if mode === "createItem"}{/if}

    {result}
  </div>
{:else}
  <h1>This Page Is Not Publiclly Availible</h1>
{/if}

<style lang="postcss">
  button {
    @apply px-4 py-2 rounded-md bg-blue-500 text-white;
  }
  .wrapper {
    @apply w-screen flex justify-around items-center mt-4;
  }
  .data-input {
    @apply border rounded-md;
  }
</style>
