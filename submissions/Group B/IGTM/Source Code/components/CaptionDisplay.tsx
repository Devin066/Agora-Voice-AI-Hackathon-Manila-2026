type CaptionDisplayProps = {
  caption: string;
};

export function CaptionDisplay({ caption }: CaptionDisplayProps) {
  return (
    <section className="flex min-h-64 items-center rounded-xl bg-[#F8F9FA] px-6 py-8">
      <p className="text-4xl font-medium leading-tight text-[#183B56] md:text-5xl">
        {caption}
      </p>
    </section>
  );
}
