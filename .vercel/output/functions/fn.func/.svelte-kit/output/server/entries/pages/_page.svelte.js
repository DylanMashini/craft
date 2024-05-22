import { c as create_ssr_component, a as subscribe, b as add_attribute, d as each, e as escape } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index2.js";
let initalItems = [
  {
    emoji: "💧",
    name: "Water"
  },
  {
    emoji: "🔥",
    name: "Fire"
  },
  {
    emoji: "🌎",
    name: "Earth"
  },
  {
    emoji: "💨",
    name: "Wind"
  }
];
let availibleItems = writable(initalItems);
if (typeof window !== "undefined") {
  let storedRecipes = localStorage.getItem("unlockedRecipes");
  if (storedRecipes) {
    availibleItems.set(JSON.parse(storedRecipes));
  }
  availibleItems.subscribe((val) => {
    localStorage.setItem("unlockedRecipes", JSON.stringify(val));
  });
}
const css = {
  code: ".item.svelte-red373{cursor:grab;border-radius:0.375rem;border-width:1px;--tw-bg-opacity:1;background-color:rgb(255 255 255 / var(--tw-bg-opacity));padding-left:1rem;padding-right:1rem;padding-top:0.5rem;padding-bottom:0.5rem\n}.dragging{cursor:grabbing !important\n}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { draggable } from \\"@neodrag/svelte\\";\\nimport { availibleItems } from \\"$lib/stores\\";\\nimport { isTouching, craft } from \\"$lib/utils\\";\\nimport { tick } from \\"svelte\\";\\nlet itemParent;\\nlet deleteBox;\\nlet draggedElements = [];\\nconst dragStart = (emoji, name, startX, startY) => {\\n  draggedElements = [\\n    ...draggedElements,\\n    {\\n      emoji,\\n      name,\\n      id: Date.now().toString(),\\n      X: startX,\\n      Y: startY,\\n      controlled: true,\\n      highlighted: false\\n    }\\n  ];\\n  document.body.style.userSelect = \\"none\\";\\n  draggedElements = draggedElements;\\n  let index = draggedElements.length - 1;\\n  let id = draggedElements[index].id;\\n  document.body.classList.add(\\"dragging\\");\\n  function updatePosition(event) {\\n    if (draggedElements[index].id !== id) {\\n      index = draggedElements.findIndex((val) => val.id === id);\\n      if (index === -1) {\\n        return;\\n      }\\n    }\\n    draggedElements[index].X = event.clientX - itemParent.offsetLeft;\\n    draggedElements[index].Y = event.clientY - itemParent.offsetTop;\\n    checkCollisionsWhileDragging();\\n    draggedElements = draggedElements;\\n  }\\n  addEventListener(\\"mousemove\\", updatePosition);\\n  addEventListener(\\n    \\"mouseup\\",\\n    () => {\\n      removeEventListener(\\"mousemove\\", updatePosition);\\n      document.body.style.userSelect = \\"\\";\\n      document.body.classList.remove(\\"dragging\\");\\n      if (draggedElements[index].id !== id) {\\n        index = draggedElements.findIndex((val) => val.id === id);\\n        if (index === -1) {\\n          return;\\n        }\\n      }\\n      draggedElements[index].controlled = false;\\n      checkCollisionsToCraft();\\n    },\\n    {\\n      once: true\\n    }\\n  );\\n};\\nconst checkCollisions = () => {\\n  for (let i = 0; i < draggedElements.length; i++) {\\n    if (!draggedElements[i].element)\\n      continue;\\n    for (let j = i + 1; j < draggedElements.length; j++) {\\n      if (!draggedElements[j].element)\\n        continue;\\n      if (isTouching(\\n        draggedElements[i].element,\\n        draggedElements[j].element\\n      )) {\\n        return [i, j];\\n      }\\n    }\\n  }\\n  return [];\\n};\\nconst checkCollisionsWhileDragging = () => {\\n  let collidedElements = checkCollisions();\\n  for (let i = 0; i < draggedElements.length; i++) {\\n    draggedElements[i].highlighted = false;\\n  }\\n  if (collidedElements.length !== 0) {\\n    draggedElements[collidedElements[0]].highlighted = true;\\n    draggedElements[collidedElements[1]].highlighted = true;\\n  }\\n  draggedElements = draggedElements;\\n};\\nconst checkCollisionsToCraft = async () => {\\n  let idsToDelete = [];\\n  for (let i = 0; i < draggedElements.length; i++) {\\n    if (typeof draggedElements[i].element === \\"undefined\\")\\n      continue;\\n    if (isTouching(draggedElements[i].element, deleteBox)) {\\n      idsToDelete.push(draggedElements[i].id);\\n    }\\n  }\\n  draggedElements = draggedElements.filter(\\n    (val) => !idsToDelete.includes(val.id)\\n  );\\n  let collisions = checkCollisions();\\n  if (collisions.length === 0 || draggedElements[collisions[0]].crafting || draggedElements[collisions[1]].crafting)\\n    return;\\n  draggedElements[collisions[0]].crafting = true;\\n  draggedElements[collisions[1]].crafting = true;\\n  let item1 = draggedElements[collisions[0]];\\n  let item2 = draggedElements[collisions[1]];\\n  let result = await craft(item1, item2);\\n  if (!item1.element || !item2.element)\\n    return;\\n  let avgX = Math.round(\\n    (item1.element?.getBoundingClientRect().left + item2.element?.getBoundingClientRect().left) / 2\\n  ) - itemParent.offsetLeft;\\n  let avgY = Math.round((item1.Y + item2.Y) / 2);\\n  draggedElements = draggedElements.filter(\\n    (val) => val.id !== draggedElements[collisions[0]].id && val.id !== draggedElements[collisions[1]].id\\n  );\\n  draggedElements = [\\n    ...draggedElements,\\n    {\\n      emoji: result.emoji,\\n      name: result.name,\\n      controlled: false,\\n      highlighted: false,\\n      id: Date.now().toString(),\\n      X: avgX,\\n      Y: avgY\\n    }\\n  ];\\n  setTimeout(() => checkCollisionsWhileDragging(), 200);\\n};\\n<\/script>\\n\\n<div class=\\"w-screen h-screen flex\\">\\n\\t<div class=\\"gap-4 flex flex-wrap p-2\\"></div>\\n\\t<div class=\\"w-[70%]\\"></div>\\n\\t<div class=\\"w-[30%] bg-gray-100\\" bind:this={deleteBox}>\\n\\t\\t<h2 class=\\"text-4xl w-full text-center mt-4\\">Unlocked Items</h2>\\n\\t\\t<div\\n\\t\\t\\tclass=\\"gap-4 flex flex-wrap w-full p-2 relative\\"\\n\\t\\t\\tbind:this={itemParent}\\n\\t\\t>\\n\\t\\t\\t{#each draggedElements as element (element.id)}\\n\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\tbind:this={element.element}\\n\\t\\t\\t\\t\\tclass=\\"item absolute {element.highlighted &&\\n\\t\\t\\t\\t\\t\\t'!bg-gray-100'}\\"\\n\\t\\t\\t\\t\\tuse:draggable={{\\n\\t\\t\\t\\t\\t\\tposition: element.controlled\\n\\t\\t\\t\\t\\t\\t\\t? {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tx: element.X,\\n\\t\\t\\t\\t\\t\\t\\t\\t\\ty: element.Y,\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t: undefined,\\n\\t\\t\\t\\t\\t\\tdefaultPosition: !element.controlled\\n\\t\\t\\t\\t\\t\\t\\t? {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tx: element.X,\\n\\t\\t\\t\\t\\t\\t\\t\\t\\ty: element.Y,\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t: undefined,\\n\\t\\t\\t\\t\\t\\tdefaultClassDragging: \\"dragging\\",\\n\\t\\t\\t\\t\\t}}\\n\\t\\t\\t\\t\\ton:neodrag={checkCollisionsWhileDragging}\\n\\t\\t\\t\\t\\ton:neodrag:end={checkCollisionsToCraft}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t{element.emoji}\\n\\t\\t\\t\\t\\t{element.name}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t\\t{#each $availibleItems as item}\\n\\t\\t\\t\\t<div id=\\"item-parent-{item.name.replaceAll(' ', '_')}\\">\\n\\t\\t\\t\\t\\t<!-- svelte-ignore a11y-click-events-have-key-events -->\\n\\t\\t\\t\\t\\t<!-- svelte-ignore a11y-no-static-element-interactions -->\\n\\t\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\t\\tclass=\\"item\\"\\n\\t\\t\\t\\t\\t\\ton:mousedown={e =>\\n\\t\\t\\t\\t\\t\\t\\tdragStart(\\n\\t\\t\\t\\t\\t\\t\\t\\titem.emoji,\\n\\t\\t\\t\\t\\t\\t\\t\\titem.name,\\n\\t\\t\\t\\t\\t\\t\\t\\te.clientX - itemParent.offsetLeft,\\n\\t\\t\\t\\t\\t\\t\\t\\te.clientY - itemParent.offsetTop\\n\\t\\t\\t\\t\\t\\t\\t)}\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t{item.emoji}\\n\\t\\t\\t\\t\\t\\t{item.name}\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/each}\\n\\t\\t</div>\\n\\t</div>\\n</div>\\n\\n<style lang=\\"postcss\\">\\n\\t.item {\\n\\n    cursor: grab;\\n\\n    border-radius: 0.375rem;\\n\\n    border-width: 1px;\\n\\n    --tw-bg-opacity: 1;\\n\\n    background-color: rgb(255 255 255 / var(--tw-bg-opacity));\\n\\n    padding-left: 1rem;\\n\\n    padding-right: 1rem;\\n\\n    padding-top: 0.5rem;\\n\\n    padding-bottom: 0.5rem\\n}\\n\\n\\t:global(.dragging) {\\n\\n    cursor: grabbing !important\\n}\\n</style>\\n"],"names":[],"mappings":"AA+LC,mBAAM,CAEH,MAAM,CAAE,IAAI,CAEZ,aAAa,CAAE,QAAQ,CAEvB,YAAY,CAAE,GAAG,CAEjB,eAAe,CAAE,CAAC,CAElB,gBAAgB,CAAE,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,eAAe,CAAC,CAAC,CAEzD,YAAY,CAAE,IAAI,CAElB,aAAa,CAAE,IAAI,CAEnB,WAAW,CAAE,MAAM,CAEnB,cAAc,CAAE,MAAM;AAC1B,CAES,SAAW,CAEhB,MAAM,CAAE,QAAQ,CAAC;AACrB"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $availibleItems, $$unsubscribe_availibleItems;
  $$unsubscribe_availibleItems = subscribe(availibleItems, (value) => $availibleItems = value);
  let itemParent;
  let deleteBox;
  let draggedElements = [];
  $$result.css.add(css);
  $$unsubscribe_availibleItems();
  return `<div class="w-screen h-screen flex"><div class="gap-4 flex flex-wrap p-2"></div> <div class="w-[70%]"></div> <div class="w-[30%] bg-gray-100"${add_attribute("this", deleteBox, 0)}><h2 class="text-4xl w-full text-center mt-4" data-svelte-h="svelte-1ce9flu">Unlocked Items</h2> <div class="gap-4 flex flex-wrap w-full p-2 relative"${add_attribute("this", itemParent, 0)}>${each(draggedElements, (element) => {
    return `<div class="${"item absolute " + escape(element.highlighted && "!bg-gray-100", true) + " svelte-red373"}"${add_attribute("this", element.element, 0)}>${escape(element.emoji)} ${escape(element.name)} </div>`;
  })} ${each($availibleItems, (item) => {
    return `<div id="${"item-parent-" + escape(item.name.replaceAll(" ", "_"), true)}">  <div class="item svelte-red373">${escape(item.emoji)} ${escape(item.name)}</div> </div>`;
  })}</div></div> </div>`;
});
export {
  Page as default
};
