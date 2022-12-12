import PaintProvider from "components/contexts/paint";
import ToolbarProvider from "components/contexts/toolbar";
import ToolbarContainer, {
  MenuItem,
} from "components/toolbar/toolbarContainer";
import Head from "next/head";
import PaintContainer from "../components/paint/paintContainer";

export default function Home() {
  const toolbarMenuItems: MenuItem[] = [
    {
      text: "meme",
      subItems: [
        { text: "Load", onClick: () => {} },
        { text: "Save", onClick: () => {} },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>paint online</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PaintProvider>
        <ToolbarProvider>
          <ToolbarContainer menuItems={toolbarMenuItems} />
        </ToolbarProvider>
        <PaintContainer />
      </PaintProvider>
    </>
  );
}
