// @flow
import { lighten } from "polished";
import * as React from "react";
import { withRouter, type RouterHistory } from "react-router-dom";
import styled, { withTheme } from "styled-components";
import UiStore from "stores/UiStore";
import ErrorBoundary from "components/ErrorBoundary";
import Tooltip from "components/Tooltip";
import embeds from "../embeds";
import isInternalUrl from "utils/isInternalUrl";
import { uploadFile } from "utils/uploadFile";

const RichMarkdownEditor = React.lazy(() => import("rich-markdown-editor"));

const EMPTY_ARRAY = [];

type Props = {
  id?: string,
  defaultValue?: string,
  readOnly?: boolean,
  grow?: boolean,
  disableEmbeds?: boolean,
  ui?: UiStore,
};

type PropsWithRef = Props & {
  forwardedRef: React.Ref<any>,
  history: RouterHistory,
};

class Editor extends React.Component<PropsWithRef> {
  onUploadImage = async (file: File) => {
    const result = await uploadFile(file, { documentId: this.props.id });
    return result.url;
  };

  onClickLink = (href: string, event: MouseEvent) => {
    // on page hash
    if (href[0] === "#") {
      window.location.href = href;
      return;
    }

    if (isInternalUrl(href) && !event.metaKey && !event.shiftKey) {
      // relative
      let navigateTo = href;

      // probably absolute
      if (href[0] !== "/") {
        try {
          const url = new URL(href);
          navigateTo = url.pathname + url.hash;
        } catch (err) {
          navigateTo = href;
        }
      }

      this.props.history.push(navigateTo);
    } else if (href) {
      window.open(href, "_blank");
    }
  };

  onShowToast = (message: string) => {
    if (this.props.ui) {
      this.props.ui.showToast(message);
    }
  };

  render() {
    return (
      <ErrorBoundary reloadOnChunkMissing>
        <StyledEditor
          ref={this.props.forwardedRef}
          uploadImage={this.onUploadImage}
          onClickLink={this.onClickLink}
          onShowToast={this.onShowToast}
          embeds={this.props.disableEmbeds ? EMPTY_ARRAY : embeds}
          tooltip={EditorTooltip}
          {...this.props}
        />
      </ErrorBoundary>
    );
  }
}

const StyledEditor = styled(RichMarkdownEditor)`
  flex-grow: ${(props) => (props.grow ? 1 : 0)};
  justify-content: start;

  > div {
    transition: ${(props) => props.theme.backgroundTransition};
  }

  .notice-block.tip,
  .notice-block.warning {
    font-weight: 500;
  }

  .ProseMirror {
    .ProseMirror-yjs-cursor {
      position: relative;
      margin-left: -1px;
      margin-right: -1px;
      border-left: 1px solid black;
      border-right: 1px solid black;
      height: 1em;
      word-break: normal;

      &:after {
        content: "";
        display: block;
        position: absolute;
        left: -8px;
        right: -8px;
        top: 0;
        bottom: 0;
      }

      > div {
        opacity: 0;
        position: absolute;
        top: -1.8em;
        font-size: 13px;
        background-color: rgb(250, 129, 0);
        font-style: normal;
        line-height: normal;
        user-select: none;
        white-space: nowrap;
        color: white;
        padding: 2px 6px;
        font-weight: 500;
        border-radius: 4px;
        pointer-events: none;
        left: -1px;
      }

      &:hover {
        > div {
          opacity: 1;
          transition: opacity 100ms ease-in-out;
        }
      }
    }
  }

  .heading-name {
    pointer-events: none;
  }

  .heading-name:first-child {
    & + h1,
    & + h2,
    & + h3,
    & + h4 {
      margin-top: 0;
    }
  }

  p {
    a {
      color: ${(props) => props.theme.text};
      border-bottom: 1px solid ${(props) => lighten(0.5, props.theme.text)};
      text-decoration: none !important;
      font-weight: 500;

      &:hover {
        border-bottom: 1px solid ${(props) => props.theme.text};
        text-decoration: none;
      }
    }
  }
`;

const EditorTooltip = ({ children, ...props }) => (
  <Tooltip offset="0, 16" delay={150} {...props}>
    <Span>{children}</Span>
  </Tooltip>
);

const Span = styled.span`
  outline: none;
`;

const EditorWithRouterAndTheme = withRouter(withTheme(Editor));

export default React.forwardRef<Props, typeof Editor>((props, ref) => (
  <EditorWithRouterAndTheme {...props} forwardedRef={ref} />
));

// > .ProseMirror-yjs-cursor:first-child {
//   margin-top: 16px;
// }

// p:first-child,
// h1:first-child,
// h2:first-child,
// h3:first-child,
// h4:first-child,
// h5:first-child,
// h6:first-child {
//   margin-top: 16px;
// }
