// Next finishes the current memory. After all coordinates were seen it celebrates,
// instead of wrapping to the first memory. Closing is supported separately by app.js.
export function createCompletionHandoff({pending,visible,photoOpen,videoOpen,start,next}){
 function advance(){if(!visible()||!photoOpen())return;if(pending())start();else next()}
 function videoEnded(){if(pending()&&visible()&&videoOpen())start()}
 return{advance,videoEnded};
}
