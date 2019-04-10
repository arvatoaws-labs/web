import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";

import { pollingDuration } from "/lib/constant/polling";

import { FailedError } from "/lib/error/FetchError";

import { Query } from "/lib/component/util";

import {
  AppLayout,
  NotFound,
  CheckDetailsContainer,
} from "/lib/component/partial";

const query = gql`
  query CheckDetailsContentQuery($namespace: String!, $name: String!) {
    check(namespace: $namespace, name: $name) {
      ...CheckDetailsContainer_check
    }
  }

  ${CheckDetailsContainer.fragments.check}
`;

class CheckDetailsContent extends React.PureComponent {
  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  render() {
    return (
      <AppLayout namespace={this.props.match.params.namespace}>
        <Query
          query={query}
          pollInterval={pollingDuration.short}
          fetchPolicy="cache-and-network"
          variables={this.props.match.params}
          onError={error => {
            if (error.networkError instanceof FailedError) {
              return;
            }

            throw error;
          }}
        >
          {({
            aborted,
            client,
            data: { check } = {},
            networkStatus,
            refetch,
          }) => {
            // see: https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/networkStatus.ts
            const loading = networkStatus < 6;

            if (!loading && !aborted && (!check || check.deleted)) {
              return <NotFound />;
            }

            return (
              <CheckDetailsContainer
                client={client}
                check={check}
                loading={loading || aborted}
                refetch={refetch}
              />
            );
          }}
        </Query>
      </AppLayout>
    );
  }
}

export default CheckDetailsContent;
