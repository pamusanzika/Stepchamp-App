/**
 * Sort an array of objects by a given text field.
 * 
 * arrayObj: any[] 
 * fieldName: string - field to sort by
 * 
 * Returns the sorted array.
 * */
export const objectArraySort = (arrayObj: any[], fieldName: string) => {
    if(arrayObj.length > 0 ){
        return arrayObj.sort((ob1, ob2) => {
            const text1 = ob1[fieldName].toLowerCase();
            const text2 = ob2[fieldName].toLowerCase();
    
            if (text1 < text2) {
                return -1;
            }
            if (text1 > text2) {
                return 1;
            }
            return 0;
        });
    }
    return arrayObj;
};