interface IButtonProps {
  text: string;
  clickEvent?: () => void;
}

export default function Button(props: IButtonProps) {
  const { text, clickEvent } = props;
  return (
    <button
      onClick={clickEvent}
      className="px-8 py-4 mx-auto rounded-md border-[2px] bg-slate-950 border-blue border-solid blueShadow duration-200"
    >
      <p>{text}</p>
    </button>
  );
}
