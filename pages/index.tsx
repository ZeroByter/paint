import PaintProvider from "components/contexts/paint";
import PaintToolbar from "components/paint/paintToolbar";
import ToolsToolbar from "components/paint/toolbar";
import Head from "next/head";
import PaintContainer from "../components/paint/paintContainer";
import css from "./index.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>paint online</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PaintProvider>
        <div className={css.root}>
          <PaintToolbar />
          <ToolsToolbar />
          <PaintContainer />
        </div>
      </PaintProvider>
    </>
  );
}
