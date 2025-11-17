import TopBar from "@/components/topBar/page";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen">
      <TopBar />
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-4xl font-bold font-custom">Cade meu filme?</h1>
        <p className="text-base w-1/2 text-center">
          Cade meu filme? é um site que ajuda você a encontrar o filme que você está procurando, te mostrando em quais streamings e países 
          ele está disponível e o plano mínimo para assistir.
        </p>
      </div>
    </div>
  );
}
