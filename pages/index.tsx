import Head from "next/head";
import PaintContainer from "../components/paint/paintContainer";

export default function Home() {
  return (
    <>
      <Head>
        <title>paint online</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PaintContainer />
    </>
  );
}
