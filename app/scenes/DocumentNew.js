// @flow
import * as React from "react";
import { inject } from "mobx-react";
import queryString from "query-string";
import type { RouterHistory, Location } from "react-router-dom";
import Flex from "components/Flex";
import CenteredContent from "components/CenteredContent";
import LoadingPlaceholder from "components/LoadingPlaceholder";
import DocumentsStore from "stores/DocumentsStore";
import UiStore from "stores/UiStore";
import { documentEditUrl } from "utils/routeHelpers";

type Props = {
  history: RouterHistory,
  location: Location,
  documents: DocumentsStore,
  ui: UiStore,
  match: Object,
};

class DocumentNew extends React.Component<Props> {
  async componentDidMount() {
    const params = queryString.parse(this.props.location.search);

    try {
      const document = await this.props.documents.create({
        collectionId: this.props.match.params.id,
        parentDocumentId: params.parentDocumentId,
        templateId: params.templateId,
        title: "",
        text: "",
      });
      this.props.history.replace(documentEditUrl(document));
    } catch (err) {
      this.props.ui.showToast("Couldn’t create the document, try again?");
      this.props.history.goBack();
    }
  }

  render() {
    return (
      <Flex column auto>
        <CenteredContent>
          <LoadingPlaceholder />
        </CenteredContent>
      </Flex>
    );
  }
}

export default inject("documents", "ui")(DocumentNew);
