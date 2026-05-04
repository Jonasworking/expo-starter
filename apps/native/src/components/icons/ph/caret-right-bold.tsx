import {
  UniwindSvgXml,
  type UniwindSvgXmlProps,
} from "@/components/ui/uniwind-svg-xml";

export const CaretRightBoldIcon = (props: Omit<UniwindSvgXmlProps, "xml">) => {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17"/></svg>`;

  return <UniwindSvgXml xml={xml} {...props} />;
};
