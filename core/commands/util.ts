import { v4 as uuidv4 } from "uuid";

import { ContextItemWithId, RangeInFileWithContents } from "../";
import { findUriInDirs, getUriPathBasename } from "../util/uri";

export function rifWithContentsToContextItem(
  rif: RangeInFileWithContents,
): ContextItemWithId {
  const basename = getUriPathBasename(rif.filepath);
  const { relativePathOrBasename, foundInDir, uri } = findUriInDirs(
    rif.filepath,
    window.workspacePaths ?? [],
  );
  const rangeStr = `(${rif.range.start.line + 1}-${rif.range.end.line + 1})`;

  return {
    content: rif.contents,
    name: `${basename} ${rangeStr}`,
    description: `${relativePathOrBasename} ${rangeStr}`,
    id: {
      providerTitle: "code",
      itemId: uuidv4(),
    },
    uri: {
      type: "file",
      value: rif.filepath,
    },
  };
}

export function ctxItemToRifWithContents(
  item: ContextItemWithId,
  linesOffByOne = false,
): RangeInFileWithContents {
  let startLine = 0;
  let endLine = 0;
  let adjustLines = linesOffByOne ? 1 : 0;

  const nameSplit = item.name.split("(");

  if (nameSplit.length > 1) {
    const lines = nameSplit[1].split(")")[0].split("-");
    startLine = Number.parseInt(lines[0], 10);
    if (startLine === 0) {
      adjustLines = 0; // safety to make sure doesn't go negative
    }
    startLine -= adjustLines;
    endLine = Number.parseInt(lines[1], 10) - adjustLines;
  }

  const rif: RangeInFileWithContents = {
    filepath: item.uri?.value || "",
    range: {
      start: {
        line: startLine,
        character: 0,
      },
      end: {
        line: endLine,
        character: 0,
      },
    },
    contents: item.content,
  };

  return rif;
}
