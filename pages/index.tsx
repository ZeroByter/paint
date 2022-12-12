import PaintProvider from "components/contexts/paint";
import ToolbarProvider from "components/contexts/toolbar";
import PaintToolbar from "components/paint/paintToolbar";
import Head from "next/head";
import PaintContainer from "../components/paint/paintContainer";

export default function Home() {
  return (
    <>
      <Head>
        <title>paint online</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PaintProvider>
        <PaintToolbar />
        <PaintContainer />
      </PaintProvider>
    </>
  );
}
