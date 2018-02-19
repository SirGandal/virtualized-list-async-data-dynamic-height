import * as faker from 'faker';

export interface RowDataTitle {
    index: number;
    
    title: string;
}

export interface RowDataDescription {
    index: number;
    
    description: string;
}

export interface RowData {
    index: number;
    imageUrl: string;
    title: () => Promise<RowDataTitle>;
    description: () => Promise<RowDataDescription>;
}

export function generateData(count: number): RowData[] {

    let data = [];
    let index = 0;
    while (index < count) {
        const rowIndex = index;
        data.push(<RowData> {
            imageUrl: getImageUrl(count, true),
            index: rowIndex,
            title: () => {
                return new Promise(
                    resolve => {
                        delayCall(
                            () => {
                                resolve(<RowDataTitle> { index: rowIndex, title: faker.lorem.sentence()});
                            },
                            1000, 2000);
                    });
            },
            description: () => {
                return new Promise(
                    resolve => {
                        delayCall(
                            () => {
                                const randomDescription = getRandomBoolean() ?
                                    faker.lorem.paragraph() :
                                    faker.lorem.paragraphs();
                                resolve(<RowDataDescription> { index: rowIndex, description: randomDescription });
                            },
                            1000, 2000);
                    });
            }
        });
        index++;
    }
    return data;
}

function getRandomBoolean() {
    return !!Math.floor(Math.random() * 2);
}

function getRandomDelay(minDelayMs: number = 1000, maxDelayMs: number = 2000) {
    if (minDelayMs > maxDelayMs) {
        [minDelayMs, maxDelayMs] = [maxDelayMs, minDelayMs];
    }

    return minDelayMs + Math.round(Math.random() * maxDelayMs);
}

function delayCall(fun: () => void, minDelayMs: number, maxDelayMs: number) {
    setTimeout(fun, getRandomDelay(minDelayMs, maxDelayMs));
}

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getImageUrl(index: number, random: boolean = false) {

    let edgeSize = randomIntFromInterval(60, 100);
    let imageUrl = '';
    const randomHexColor = Math.floor(Math.random() * 16777215).toString(16);

    switch (random ? randomIntFromInterval(0, 10) : 0) {
        case 0: imageUrl = `https://dummyimage.com/${edgeSize}/${randomHexColor}?text=${index + 1}`;
                break;
        case 1: imageUrl = `http://via.placeholder.com/${edgeSize}/${randomHexColor}`;
                break;
        case 2: imageUrl = `https://picsum.photos/${edgeSize}/${edgeSize}/?random`;
                break;
        case 3: imageUrl = `https://placeimg.com/${edgeSize}/${edgeSize}/any`;
                break;
        case 4: imageUrl = `http://pipsum.com/${edgeSize}x${edgeSize}.jpg`;
                break;
        case 5: imageUrl = `http://placekitten.com/g/${edgeSize}/${edgeSize}`;
                break;
        case 6: imageUrl = `https://source.unsplash.com/random/${edgeSize}x${edgeSize}`;
                break;
        case 7: imageUrl = `http://www.placecage.com/c/${edgeSize}/${edgeSize}`;
                break;
        case 8: imageUrl = `http://www.placecage.com/${edgeSize}/${edgeSize}`;
                break;
        case 9: imageUrl = `http://www.placecage.com/g/${edgeSize}/${edgeSize}`;
                break;
        default:
                break;
    }

    return imageUrl;
}