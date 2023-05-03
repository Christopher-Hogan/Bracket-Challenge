import { createElement, useEffect, useState, useCallback } from "react";
import { Flipper, Flipped } from 'react-flip-toolkit'
import shuffle from 'lodash.shuffle'
import loadingCircleSvg from "./ui/loading-circle.svg";
import "./ui/RestLeaderboard.css";

export function RestLeaderboard({ endpoint, refresh, datasource, content, shuffle }) {

    const [loaded, setLoaded] = useState(false);
    const [scores, setScores] = useState([]);

    useEffect(() => {
        setInterval(fetchLeaderboard, refresh);
    }, []);

    function compare( a, b ) {
        if ( a.score > b.score ){
          return -1;
        }
        if ( a.score < b.score ){
          return 1;
        }
        return 0;
    }

    const fetchLeaderboard = () => {
        fetch(endpoint?.value, { headers: { "accept": "application/json"} })
            .then((res) => res.json())
            .then((res) => {                
                //hack to get scores
                setScores(oldScores => {
                    let newScores = oldScores.map(s => {
                        let item = res.find(r => r?.PhotoGUID === s.item.id);
                        if(item) {
                            return { "score": item?.CompScore, "item": s.item };
                        }
                    });
                    newScores.sort( compare );

                    // update items here (relies upon the sort happening)
                    let flipperDiv = document.getElementById("flipLeaderboard");
                    //let flippedDivs = flipperDiv.children.item(0).children;

                    newScores.forEach(s => {
                        let score = flipperDiv.querySelector(`div[data-flip-id="${s.item.id}"] .mx-score`);
                        score.innerText = s.score.toFixed(2);
                    });

                    // [...flippedDivs].forEach((d, i) => {
                    //     let score = d.getElementsByClassName("mx-score")[0];
                    //     score.innerText = oldScores[i].score.toFixed(2);
                    // });
                    
                    return newScores;
            });
        });
    }

    const shuffleList = () => setScores(shuffle(scores));

    //convert the datasource to scores:
    const renderLeaderboard = () => {
        
        if(!loaded) {
            let converted = datasource.items.map(data => { 
                return { "score":0, "item": data };
            });
            setScores(converted);
            setLoaded(true);
        }

        let button;
        if(shuffle) {
            button = <button onClick={shuffleList}> shuffle</button>
        } 

        return (
            <div>
                {button}
                <div id="flipLeaderboard">
                    <Flipper flipKey={scores.map(score => score.item.id).join('')}>
                        {scores.map((score, idx) => (
                            <Flipped key={score.item.id} flipId={score.item.id}>
                                <div>
                                    {content?.get(score.item)}
                                </div>
                            </Flipped>
                        ))}
                    </Flipper>
                </div>
            </div>
        );
    };

    const renderLoading = () => {
        return (
            <div className="leader-loading">
                <img src={loadingCircleSvg} className="widget-loading-spinner" alt="" aria-hidden />
            </div>
        );
    };

    return datasource?.status !== "available" ? renderLoading() : renderLeaderboard();
}
