import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const reStartButton = document.querySelector(".game-text > button");


// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;//무빙을 실행전에 담아두는 용도



const movingItem = {//블럭의 좌표와 정보들을 가지고있다
    type:"",
    direction:3,// 화살표윗 방향키를 눌렀을때 좌우로 돌리는 역할을 도와주는 지표
    top:0,// 위에 기준
    left:3// 좌우 기준
    
}

init();

// functions

function init(){
    tempMovingItem = {...movingItem };// 스프레드 오퍼레이터를 이용

    
    for(let i=0; i<20; i++){
        prependNewLine();
    }
    generateNewBlock();
}


function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}
function renderBlocks(moveType=""){
    const {type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving =>{
        moving.classList.remove(type,"moving");
    })
    BLOCKS[type][direction].some(block=>{
        const x = block[0] + left;
        const y = block[1] + top;

        //사망 연산자 = 조건? 참일경우 : 거짓일 경우
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type, "moving");
        }else{
            tempMovingItem = { ...movingItem }
            if(moveType === "retry"){
                clearInterval(downInterval)
                showGameoverText()
            }
            setTimeout(() => {
                renderBlocks("retry");
                if(moveType === "top"){
                    seizeBlock();
                }
            }, 0)
            //renderBlocks();
            return true;
        }

    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction= direction;
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checMatch();
}

function checMatch(){
    
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched =true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score+=100;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock();

}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top',1);
    }, duration);


    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}
function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}
function chageDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlocks(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top',1);
    }, 10);
}

function showGameoverText(){
    gameText.style.display = "flex";
}

// event handlig
document.addEventListener("keydown",e=>{
    switch(e.keyCode){
        case 39:
            moveBlock("left",1);
            break;
        case 37:
            moveBlock("left",-1);
            break;

        case 40:
            moveBlock("top",1);
            break;

        case 38:
            chageDirection();
            break;

        case 32:
            dropBlocks();    
        default:
            break;
    }

})

reStartButton.addEventListener("click",()=>{
    playground.innerHTML = "";
    gameText.style.display = "none";
    score = 0;
    scoreDisplay.innerText = score;
    init();
})