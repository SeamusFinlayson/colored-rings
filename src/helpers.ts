import OBR, { isShape, Item, Image, buildShape } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

/** Update the selected state of the color buttons */
export async function updateColorButtons(items: Item[]) {
  const selection = await OBR.player.getSelection();
  // Remove all previous selected states
  document.querySelectorAll(".color-button").forEach((element) => {
    element.classList.remove("selected");
  });
  // Get all the status rings that are attached to our current selection
  for (const item of items) {
    if (
      item.metadata[getPluginId("metadata")]?.enabled &&
      isShape(item) &&
      item.attachedTo &&
      selection?.includes(item.attachedTo)
    ) {
      // Add selected state to this rings color
      const color = item.style.strokeColor;
      document.getElementById(color)?.classList.add("selected");
    }
  }
}

/**
 * Helper to build a circle shape with the proper size to match
 * the input image's size
 */
export function buildStatusRing(
  item: Image,
  color: string,
  dpi: number,
  scale: number
) {
  const dpiScale = dpi / item.grid.dpi;
  const width = item.image.width * dpiScale;
  const height = item.image.height * dpiScale;
  const diameter = Math.min(width, height);
  const offsetX = (item.grid.offset.x / item.image.width) * width;
  const offsetY = (item.grid.offset.y / item.image.height) * height;
  // Apply image offset and offset circle position so the origin is the top left
  const position = {
    x: item.position.x - offsetX + width / 2,
    y: item.position.y - offsetY + height / 2,
  };
  const circle = buildShape()
    .width(diameter)
    .height(diameter)
    .scale({ x: scale, y: scale })
    .position(position)
    .fillOpacity(0)
    .strokeColor(color)
    .strokeOpacity(1)
    .strokeWidth(5)
    .shapeType("CIRCLE")
    .attachedTo(item.id)
    .locked(true)
    .name("Status Ring")
    .metadata({ [getPluginId("metadata")]: { enabled: true } })
    .layer("ATTACHMENT")
    .disableHit(true)
    .build();

  return circle;
}

/** Update the status rings for the current selection so that there are no gaps */
export function updateStatusRingScales(selection: string[]) {
  return OBR.scene.items.updateItems(
    (item) =>
      item.metadata[getPluginId("metadata")]?.enabled &&
      item.attachedTo &&
      selection.includes(item.attachedTo),
    (items) => {
      for (const id of selection) {
        const attached = items.filter((item) => item.attachedTo == id);
        for (let i = 0; i < attached.length; i++) {
          const scale = 1 - i * 0.1;
          attached[i].scale = { x: scale, y: scale };
        }
      }
    }
  );
}
