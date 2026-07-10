import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="prose-table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-docs">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
