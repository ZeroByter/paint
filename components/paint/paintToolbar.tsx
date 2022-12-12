import Layer from "@shared/types/layer";
import { PaintFetcher } from "components/contexts/paint";
import ToolbarProvider from "components/contexts/toolbar";
import ToolbarContainer, {
  MenuItem,
} from "components/toolbar/toolbarContainer";
import { isEmpty } from "lodash/fp";
import { FC } from "react";

const PaintToolbar: FC = () => {
  const { loadFromImage } = PaintFetcher();

  const handleLoadUrl = () => {
    const url =
      "https://cdn.pixabay.com/photo/2015/03/17/02/01/cubes-677092__480.png"; //prompt("Image URL");

    if (isEmpty(url)) return;

    const image = new Image();
    image.src = url;
    image.onload = () => {
      loadFromImage(image);
    };
  };

  const toolbarMenuItems: MenuItem[] = [
    {
      text: "meme",
      subItems: [
        { text: "Load (URL)", onClick: handleLoadUrl },
        { text: "Load (local)", onClick: () => {} },
        { text: "Save", onClick: () => {} },
      ],
    },
  ];

  return (
    <ToolbarProvider>
      <ToolbarContainer menuItems={toolbarMenuItems} />
    </ToolbarProvider>
  );
};

export default PaintToolbar;
