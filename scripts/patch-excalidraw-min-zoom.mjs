import fs from "node:fs";

const MIN_ZOOM = "0.02";

const patches = [
  {
    file: "node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js",
    from: "var MIN_ZOOM = 0.1;",
    to: `var MIN_ZOOM = ${MIN_ZOOM};`,
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/prod/chunk-K2UTITRG.js",
    from: "Js=.1,Ys=30",
    to: `Js=${MIN_ZOOM},Ys=30`,
  },
];

const markerDrawDev = `        const markerColor = element.customData?.marker;
        if (markerColor && markerColor !== "transparent") {
          context.save();
          context.globalAlpha = 0.72;
          context.fillStyle = markerColor;
          for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (!line) continue;
            const lineWidth = context.measureText(line).width;
            let lineX = horizontalOffset;
            if (element.textAlign === "center") lineX -= lineWidth / 2;
            else if (element.textAlign === "right") lineX -= lineWidth;
            const bandTop = index * lineHeightPx + lineHeightPx * 0.16;
            const bandHeight = lineHeightPx * 0.7;
            context.beginPath();
            if (context.roundRect) {
              context.roundRect(lineX, bandTop, lineWidth, bandHeight, Math.min(3, bandHeight / 2));
            } else {
              context.rect(lineX, bandTop, lineWidth, bandHeight);
            }
            context.fill();
          }
          context.restore();
        }
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          context.fillText(
            lines[lineIndex],
            horizontalOffset,
            lineIndex * lineHeightPx + verticalOffset
          );
        }`;

const markerDrawProd = `if(e.customData&&e.customData.marker&&e.customData.marker!=="transparent"){n.save(),n.globalAlpha=.72,n.fillStyle=e.customData.marker;for(let U=0;U<s.length;U++){let h=s[U];if(!h)continue;let w=n.measureText(h).width,x=d;e.textAlign==="center"?x-=w/2:e.textAlign==="right"&&(x-=w);let y=U*c+c*.16,bh=c*.7;n.beginPath(),n.roundRect?n.roundRect(x,y,w,bh,Math.min(3,bh/2)):n.rect(x,y,w,bh),n.fill()}n.restore()}for(let lineIndex=0;lineIndex<s.length;lineIndex++)n.fillText(s[lineIndex],d,lineIndex*c+l);`;

const markerPatches = [
  {
    file: "node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js",
    from: `        for (let index = 0; index < lines.length; index++) {
          context.fillText(
            lines[index],
            horizontalOffset,
            index * lineHeightPx + verticalOffset
          );
        }`,
    to: markerDrawDev,
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/prod/chunk-K2UTITRG.js",
    from: "for(let U=0;U<s.length;U++)n.fillText(s[U],d,U*c+l);",
    to: markerDrawProd,
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js",
    from: "  const containingFrameOpacity = getContainingFrame(element, elementsMap)?.opacity || 100;\n  if (!prevElementWithCanvas || shouldRegenerateBecauseZoom || prevElementWithCanvas.theme !== appState.theme || prevElementWithCanvas.boundTextElementVersion !== boundTextElementVersion || prevElementWithCanvas.imageCrop !== imageCrop || prevElementWithCanvas.containingFrameOpacity !== containingFrameOpacity ||",
    to: "  const containingFrameOpacity = getContainingFrame(element, elementsMap)?.opacity || 100;\n  const textPaint = isTextElement(element) ? `${element.strokeColor}|${element.fontSize}|${element.fontFamily}|${element.textAlign}|${element.text}|${element.customData?.marker || \"\"}` : \"\";\n  if (!prevElementWithCanvas || shouldRegenerateBecauseZoom || prevElementWithCanvas.theme !== appState.theme || prevElementWithCanvas.boundTextElementVersion !== boundTextElementVersion || prevElementWithCanvas.imageCrop !== imageCrop || prevElementWithCanvas.containingFrameOpacity !== containingFrameOpacity || prevElementWithCanvas.textPaint !== textPaint ||",
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js",
    from: `    if (!elementWithCanvas) {
      return null;
    }
    elementWithCanvasCache.set(element, elementWithCanvas);`,
    to: `    if (!elementWithCanvas) {
      return null;
    }
    elementWithCanvas.textPaint = textPaint;
    elementWithCanvasCache.set(element, elementWithCanvas);`,
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/prod/chunk-K2UTITRG.js",
    from: ",l=We(e,t)?.opacity||100;if(!i||a||i.theme!==r.theme||i.boundTextElementVersion!==d||i.imageCrop!==c||i.containingFrameOpacity!==l||ee(e)&&s&&e.angle!==i.angle){let U=K1(e,t,o,n,r);return U?(Jo.set(e,U),U):null}return i}",
    to: ",l=We(e,t)?.opacity||100,tp=k(e)?e.strokeColor+\"|\"+e.fontSize+\"|\"+e.fontFamily+\"|\"+e.textAlign+\"|\"+e.text+\"|\"+(e.customData&&e.customData.marker||\"\"):\"\";if(!i||a||i.theme!==r.theme||i.boundTextElementVersion!==d||i.imageCrop!==c||i.containingFrameOpacity!==l||i.textPaint!==tp||ee(e)&&s&&e.angle!==i.angle){let U=K1(e,t,o,n,r);return U?(U.textPaint=tp,Jo.set(e,U),U):null}return i}",
  },
];

const gridPatches = [
  {
    file: "node_modules/@excalidraw/excalidraw/dist/dev/chunk-4FTI6OG3.js",
    from: "if (actualGridSize < 8 || !isBold && actualGridSize < 10) {\n      continue;\n    }",
    to: "if (!isBold && actualGridSize < 10) {\n      continue;\n    }",
  },
  {
    file: "node_modules/@excalidraw/excalidraw/dist/prod/chunk-K2UTITRG.js",
    from: "if(l<8||!m&&l<10)continue;",
    to: "if(!m&&l<10)continue;",
  },
];

for (const patch of [...patches, ...gridPatches, ...markerPatches]) {
  if (!fs.existsSync(patch.file)) {
    console.warn(`skip missing ${patch.file}`);
    continue;
  }
  const source = fs.readFileSync(patch.file, "utf8");
  const already =
    patch.to &&
    source.split(patch.to).length - 1 >=
      (source.split(patch.from).length - 1 || 1) &&
    !source.includes(patch.from);
  if (already || (source.includes(patch.to) && !source.includes(patch.from))) {
    continue;
  }
  if (!source.includes(patch.from)) {
    console.warn(`excalidraw patch pattern missing in ${patch.file}`);
    continue;
  }
  fs.writeFileSync(patch.file, source.split(patch.from).join(patch.to));
  console.log(`patched ${patch.file}`);
}
