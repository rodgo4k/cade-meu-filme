import Logo from "../Logo";

export default function TopBar() {
  return (
    <div className="flex justify-between items-center py-4 px-12 w-full">
      <div className="flex items-center gap-4">
          <Logo color="currentColor" width={71} height={53} />
          <h1 className="text-2xl font-bold font-custom">Cade meu filme?</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="menu-button">Inicio</button>
        <button className="menu-button">Contribua</button>
      </div>
    </div>
  );
}