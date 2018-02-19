import * as React from 'react';
import * as styles from './InfiniteLoaderExample.module.css';
import { AutoSizer, InfiniteLoader, List, ListRowProps } from 'react-virtualized';
import { InfiniteLoaderItem } from './InfiniteLoaderItem';
import { generateData, RowData, RowDataTitle, RowDataDescription } from './dataGeneratorUtils';

const enum ROW_STATUS {
  LOADING = 1,
  LOADED
}

interface InfiniteLoaderExampleProps { }
interface InfiniteLoaderExampleState {
  loadedRowCount: number;
  loadedRowsMap: object;
  loadingRowCount: number;

  list: RowData[];
}

class InfiniteLoaderExample extends React.Component<InfiniteLoaderExampleProps, InfiniteLoaderExampleState> {
  _ref: List;
  rowIndexToRowHeight = {};
  topRowIndex = 0;

  constructor(props: InfiniteLoaderExampleProps) {
    super(props);

    this.state = {
      list: generateData(1000),
      loadedRowCount: 0,
      loadedRowsMap: {},
      loadingRowCount: 0,
    };

    this._getRowHeight = this._getRowHeight.bind(this);

    this._isRowLoaded = this._isRowLoaded.bind(this);
    this._getRowsContent = this._getRowsContent.bind(this);
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  render() {
    const { list } = this.state;

    return (

      <AutoSizer>
        {({ height }) => (
          <InfiniteLoader
            isRowLoaded={this._isRowLoaded}
            loadMoreRows={this._getRowsContent}
            rowCount={list.length}
          >
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={(ref: List) => {
                  registerChild(ref);
                  this._ref = ref;
                }}
                overscanRowCount={5}
                className={styles.List}
                height={height}
                onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex }) => {
                  this.topRowIndex = startIndex;
                  if (this._ref) {
                    window.requestAnimationFrame(() => setTimeout(() => {
                      this._ref.recomputeRowHeights(startIndex);
                    }));
                  }
                  onRowsRendered({ startIndex, stopIndex });
                }}
                rowCount={list.length}
                rowHeight={this._getRowHeight}
                rowRenderer={this._rowRenderer}
                width={400}
              />

            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }

  _isRowLoaded(row: { index: number }) {
    const { loadedRowsMap } = this.state;
    return loadedRowsMap[row.index] && !!loadedRowsMap[row.index].status; // STATUS_LOADING or STATUS_LOADED
  }

  _getRowHeight(row: { index: number }) {
    if (this.rowIndexToRowHeight[row.index] != null) {
      return this.rowIndexToRowHeight[row.index];
    }
    return 50;
  }

  _getRowsContent(rows: { startIndex: number, stopIndex: number }) {
    const { loadedRowsMap } = this.state;
    const increment = rows.stopIndex - rows.startIndex + 1;
    let promiseResolver: () => void;
    const promises: Array<Promise<RowDataTitle> | Promise<RowDataDescription>> = [];

    for (var i = rows.startIndex; i <= rows.stopIndex; i++) {
      const data = this._getData(i);

      if (!loadedRowsMap[i]) {
        loadedRowsMap[i] = {};
      }
      loadedRowsMap[i].status = ROW_STATUS.LOADING;

      // Add data that is available right away
      loadedRowsMap[i].imageUrl = data.imageUrl;

      // Add data that is lazily resolved
      promises.push(data.title());
      promises.push(data.description());
    }

    this.setState({
      loadingRowCount: this.state.loadingRowCount + increment,
    });

    // need to cast to any to make the ts compiler happy
    Promise.all<RowDataTitle, RowDataDescription>(promises as any)
      .then((contents: (RowDataTitle | RowDataDescription)[]) => {
      const { loadedRowCount, loadingRowCount } = this.state;

      for (let content of contents) {
        loadedRowsMap[content.index].status = ROW_STATUS.LOADED;
        if ((content as RowDataTitle).title) {
          loadedRowsMap[content.index].title = (content as {index: number, title: string}).title;
        } else if ((content as RowDataDescription).description) {
          loadedRowsMap[content.index].description = (content as {index: number, description: string}).description;
        }
      }

      this.setState({
        loadingRowCount: loadingRowCount - contents.length,
        loadedRowCount: loadedRowCount + contents.length,
      });

      promiseResolver();
    });

    return new Promise((resolve: () => void) => {
      promiseResolver = resolve;
    });
  }

  _getData(index: number) {
    const { list } = this.state;
    return list[index % list.length];
  }

  _rowRenderer(props: ListRowProps) {

    const { loadedRowsMap } = this.state;

    let content: JSX.Element;

    if (loadedRowsMap[props.index] && loadedRowsMap[props.index].status === ROW_STATUS.LOADED) {
      content = (
        <InfiniteLoaderItem
          title={loadedRowsMap[props.index].title}
          description={loadedRowsMap[props.index].description}
          imageUrl={loadedRowsMap[props.index].imageUrl}
          index={props.index}
          key={props.key}
          heightChangedCallback={(rowIndex, rowHeight) => {
            if (this.rowIndexToRowHeight[rowIndex] == null || this.rowIndexToRowHeight[rowIndex] < rowHeight) {
              this.rowIndexToRowHeight[rowIndex] = rowHeight;
              this._ref.recomputeRowHeights(this.topRowIndex);
            }
          }}
        />);
    } else {
      content = (
        <div className={styles.ldsEllipsis}><div></div><div></div><div></div><div></div></div>
      );
    }

    return (
      <div className={styles.row} key={props.key} style={props.style}>
        {content}
      </div>
    );
  }
}

export default InfiniteLoaderExample;
