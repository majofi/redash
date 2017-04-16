import uiGridTemplate from './uigrid.html';
import uiGridEditorTemplate from './uigrid-editor.html';
import { getColumnCleanName } from '../../services/query-result';

function UiGridRenderer() {
  return {
    restrict: 'E',
    template: uiGridTemplate,
    controller($scope, $filter, uiGridConstants) {
      $scope.gridOptions = {
        onRegisterApi: (gridApi) => { $scope.gridApi = gridApi; },
      };

      const refreshData = () => {
        const data = $scope.queryResult.getData();

        if (data) {
          const showColumnFooter = $scope.visualization.options.uiGridShowColumnFooter;
          const showGridFooter = $scope.visualization.options.uiGridShowGridFooter;
          const enableFiltering = $scope.visualization.options.uiGridEnableFiltering;
          const pinLeftColumn = $scope.visualization.options.uiGridPinLeftColumn;
          const pinRightColumn = $scope.visualization.options.uiGridPinRightColumn;
          const enablePagination = $scope.visualization.options.enablePagination;
          const paginationPageSize = $scope.visualization.options.paginationPageSize;
          const paginationPageSizes = $scope.visualization.options.paginationPageSizes.split(',');
          const enableColumnMenus = $scope.visualization.options.enableColumnMenus;
          const enableSorting = $scope.visualization.options.enableSorting;
          const columns = $scope.queryResult.getColumns();
          const columnDefs = [];
          const enablePinning = true;

          columns.forEach((col) => {
            const columnOptions = {
              field: getColumnCleanName(col.name),
              pinnedLeft: false,
              pinnedRight: false,
              minWidth: 50,
            };

            if (col.name === pinLeftColumn) {
              columnOptions.pinnedLeft = true;
            }

            if (col.name === pinRightColumn) {
              columnOptions.pinnedRight = true;
            }

            if ($scope.visualization.options.uiGridMinColWidths &&
                $scope.visualization.options.uiGridMinColWidths[col.name] > 0) {
              columnOptions.minWidth = $scope.visualization.options.uiGridMinColWidths[col.name];
            }

            if (col.type === 'integer' || col.type === 'float') {
              columnOptions.aggregationType = uiGridConstants.aggregationTypes.sum;
            } else {
              columnOptions.groupable = true;
            }

            columnDefs.push(columnOptions);
          });

          $scope.gridOptions.enableFiltering = enableFiltering;
          $scope.gridOptions.showGridFooter = showGridFooter;
          $scope.gridOptions.showColumnFooter = showColumnFooter;
          $scope.gridOptions.columnDefs = columnDefs;
          $scope.gridOptions.enablePinning = enablePinning;
          $scope.gridOptions.enablePagination = enablePagination;
          $scope.gridOptions.enablePaginationControls = enablePagination;
          $scope.gridOptions.paginationPageSize = paginationPageSize;
          $scope.gridOptions.paginationPageSizes = paginationPageSizes;
          $scope.gridOptions.enableColumnMenus = enableColumnMenus;
          $scope.gridOptions.enableSorting = enableSorting;
          $scope.gridOptions.data = data;
        }

        if ($scope.gridApi) {
          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
        }
      };

      $scope.$watch('visualization.options', refreshData, true);
    },
  };
}

function UiGridEditor() {
  return {
    restrict: 'E',
    template: uiGridEditorTemplate,

    link(scope) {
      scope.currentTab = 'general';

      scope.stackingOptions = {
        Disabled: null,
        Enabled: 'normal',
        Percent: 'percent',
      };

      scope.changeTab = (tab) => {
        scope.currentTab = tab;
      };
    },
  };
}

export default function (ngModule) {
  ngModule.directive('uigridEditor', UiGridEditor);
  ngModule.directive('uigridRenderer', UiGridRenderer);

  ngModule.config((VisualizationProvider) => {
    const type = 'UIGRID';
    const name = 'UiGrid';
    const renderTemplate =
        '<uigrid-renderer ' +
        'options="visualization.options" query-result="queryResult">' +
        '</uigrid-renderer>';
    const editorTemplate = '<uigrid-editor></uigrid-editor>';
    const defaultOptions = {
      uiGridShowColumnFooter: true,
      uiGridShowGridFooter: true,
      uiGridEnableFiltering: true,
      enablePagination: true,
      paginationPageSize: 100,
      paginationPageSizes: '250, 500, 1000',
      enableColumnMenus: true,
      enableSorting: true,
      uiGridMinColWidths: {},
    };

    VisualizationProvider.registerVisualization({
      type,
      name,
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}
