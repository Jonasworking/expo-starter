import { UniwindSvgXml, type UniwindSvgXmlProps } from "@/components/ui/uniwind-svg-xml";

export const CheckBoldIcon = (props: Omit<UniwindSvgXmlProps, "xml">) => {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z"/></svg>`;

  return <UniwindSvgXml xml={xml} {...props} />;
};
