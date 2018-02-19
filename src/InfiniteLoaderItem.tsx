import * as React from 'react';
import * as styles from './InfiniteLoaderItem.module.css';

interface InfiniteLoaderItemProps {
    title: string;
    description: string;
    imageUrl: string;
    index: number;
    key: string;
    heightChangedCallback: (rowIndex: number, rowHeight: number) => void;
}
interface InfiniteLoaderItemState { }

export class InfiniteLoaderItem extends React.Component<InfiniteLoaderItemProps, InfiniteLoaderItemState> {

    _ref: HTMLDivElement;

    constructor(props: InfiniteLoaderItemProps) {
        super(props);

        this._storeRef = this._storeRef.bind(this);
        this.onElementLoaded = this.onElementLoaded.bind(this);
    }

    componentDidMount() {
        this.onElementLoaded();
    }

    onElementLoaded() {
        setTimeout(() => {
            // wait for a paint before calculating the actual dom height
            window.requestAnimationFrame(() => {
                if (this._ref) {
                    const maxHeight = this.getMaxHeight(this._ref);

                    if (maxHeight.waitForElementsLoaded.length > 0) {
                        Promise.all(maxHeight.waitForElementsLoaded).then(() => {
                            // once all the promises have been resolved it means
                            // that all the images inside the element are loaded (in our case)
                            // hence we have to recompute the max height to see if
                            // the image has changed anything after loading
                            const newMaxHeight = this.getMaxHeight(this._ref);

                            this.removeLoadingIndicator();

                            if (newMaxHeight.currentMax > maxHeight.currentMax) {
                                this.props.heightChangedCallback(this.props.index, newMaxHeight.currentMax);
                            }
                        });
                    } else {
                        this.removeLoadingIndicator();
                    }

                    // setting the element to visible here seems to limit the artifact that appear
                    // after the lazy content is loaded but the heights still need to be recomputed
                    if (this._ref) {
                        this._ref.style.opacity = '1';
                    }

                    // as we potentially wait for the delayed heights let's 
                    // render what we have with the current height
                    this.props.heightChangedCallback(this.props.index, maxHeight.currentMax);

                }
            });
        });
    }

    removeLoadingIndicator() {
        if (this._ref) {
            const loadingIndicator = this._ref.firstChild;
            if (loadingIndicator) {
                this._ref.removeChild(loadingIndicator);
            }
        }
    }

    getMaxHeight(element: HTMLDivElement) {
        let onElementsLoaded = [];

        let max = 0;
        let queue = [element];

        while (queue.length > 0) {
            let currentElement = queue.shift();

            if (!currentElement) {
                continue;
            }

            // NOTE: we should push a promise for anything we want to wait loading 
            // before we recalculate the heights

            if (currentElement instanceof HTMLImageElement &&
                !currentElement.complete) {
                onElementsLoaded.push(new Promise(resolve => {
                    if (currentElement) {
                        // if it's not loaded we have to wait before calculating the height
                        currentElement.onload = () => resolve();
                        currentElement.onerror = () => resolve();
                    }
                }));
            } else {
                if (currentElement.scrollHeight > max) {
                    max = currentElement.scrollHeight;
                }
            }

            if (!currentElement.children) {
                continue;
            }

            queue = queue.concat(Array.prototype.slice.call(currentElement.children));
        }
        // + 4 for the loading bar
        return { currentMax: max + 4, waitForElementsLoaded: onElementsLoaded };
    }

    _storeRef(element: HTMLDivElement) {
        this._ref = element;
    }

    render() {
        return (
            <div ref={this._storeRef} className={styles.row} style={{ opacity: 0 }}>
                <div className={styles.loader}/>
                <img src={this.props.imageUrl} />
                <div>
                    <div className={styles.name}>{this.props.title}</div>
                    <div className={styles.index}>This is row {this.props.index}</div>
                    {this.props.description}
                </div>
            </div>
        );
    }
}

export default InfiniteLoaderItem;