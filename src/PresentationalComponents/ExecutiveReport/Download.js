import './_Download.scss';

import {
  RULES_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  STATS_SYSTEMS_FETCH_URL,
} from '../../AppConstants';
import React, { useMemo, useState } from 'react';

import { DownloadButton } from '@redhat-cloud-services/frontend-components-pdf-generator/dist/esm/index';
import ExportIcon from '@patternfly/react-icons/dist/js/icons/export-icon';
import { Get } from '../../Utilities/Api';
import buildExecReport from './Build';
import messages from '../../Messages';
import { useIntl } from 'react-intl';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const dataFetch = async () => {
    setLoading(true);
    const [statsSystems, statsReports, topActiveRec] = await Promise.all([
      (await Get(STATS_SYSTEMS_FETCH_URL)).data,
      (await Get(STATS_REPORTS_FETCH_URL)).data,
      (
        await Get(
          RULES_FETCH_URL,
          {},
          { limit: 3, sort: '-total_risk,-impacted_count', impacting: true }
        )
      ).data,
    ]);
    const report = buildExecReport({
      statsReports,
      statsSystems,
      topActiveRec,
      intl,
    });
    setLoading(false);

    return [report];
  };

  return useMemo(() => {
    return (
      <DownloadButton
        groupName={intl.formatMessage(messages.redHatInsights)}
        label={
          loading
            ? intl.formatMessage(messages.loading)
            : intl.formatMessage(messages.downloadExecutiveLabel)
        }
        asyncFunction={dataFetch}
        buttonProps={{
          variant: 'link',
          icon: <ExportIcon className="iconOverride" />,
          component: 'a',
          className: 'downloadButtonOverride',
          isAriaDisabled: isDisabled,
          ...(loading ? { isDisabled: true } : null),
        }}
        type={intl.formatMessage(messages.insightsHeader)}
        fileName={`Advisor-Executive-Report--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`}
      />
    );
  }, [loading]);
};

export default DownloadExecReport;
