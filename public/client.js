"use strict";
/**
 * @Author Matthew Starkey
 * VERSION 0.0.1 WIP
 * This is a Web Application for Chess done as a fun side project
 * Uses Node for backend piece validation. No server networking done **yet**
 * TODO: add chess AI after game is complete
 */


//Last piece clicked. Used to move piece to new position.
let lastClickedPosition = 0;
let blocks = []; //pieces blocking last clicked piece, used for path collision
let isWhiteTurn = true; //boolean to control whos turn it is;
(function() {

    window.addEventListener('load', init);

    function init(){
      drawBoard();
      placePieces();
      let board = id('board').children;
      for (let i = 0; i < board.length; i++) {
          board[i].addEventListener('click', function() {
            let position = i;
            let piece = board[i];
            pieceClicked(piece,position);
          });
      }
    }

    /**
     * Draws all board tiles and inserts into board's DOM tree
     */
    function drawBoard() {
        let board = id('board');
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let lightsquare = document.createElement('div');
                lightsquare.classList.add('tile');
                lightsquare.classList.add('tile-light');
                let darksquare = document.createElement('div');
                darksquare.classList.add('tile');
                darksquare.classList.add('tile-dark');
                if(row % 2 == 0) {
                    if(col % 2 == 0) {
                        lightsquare.id = "" + col + row;
                        board.appendChild(lightsquare);
                    } else {
                        darksquare.id = "" + col + row;
                        board.appendChild(darksquare);
                    }
                } else {
                    if (col % 2 == 0) {
                        darksquare.id = "" + col + row;
                        board.appendChild(darksquare);
                    } else {
                        lightsquare.id = "" + col + row;
                        board.appendChild(lightsquare);
                    }
                }
            }
        }
    }

    /**
     * Places all PNG images of pieces onto board tiles
     * TODO: change images to not look shitty
     */
    function placePieces() {
        let board = id('board').children;
        for (let i = 0; i < 8; i += 7) {
            let blackrook = document.createElement("img");
            blackrook.classList.add('piece');
            blackrook.src = "sources/rook-black.png";
            blackrook.alt = "rook-black";
            board[i].appendChild(blackrook);
            movePiece(-1, i, blackrook.alt);
        }

        for (let i = 1; i < 8; i +=5) {
            let knight = document.createElement("img");
            knight.classList.add('piece');
            knight.src = "sources/knight-black.png"
            knight.alt = "knight-black";
            board[i].appendChild(knight);
            movePiece(-1, i, knight.alt);
        }

        for (let i = 2; i < 8; i += 3) {
            let bishop = document.createElement("img");
            bishop.classList.add('piece');
            bishop.src = "sources/bishop-black.png"
            bishop.alt = "bishop-black";
            board[i].appendChild(bishop);
            movePiece(-1, i, bishop.alt);
        }

        for (let i = 8; i < 16; i++) {
            let pawn = document.createElement('img');
            pawn.classList.add('piece');
            pawn.src = "sources/pawn-black.png";
            pawn.alt = "pawn-black";
            board[i].appendChild(pawn);
            movePiece(-1, i, pawn.alt);
        }

        let queen = document.createElement('img');
        queen.classList.add('piece');
        queen.src = "sources/queen-black.png";
        queen.alt = "queen-black";
        board[3].appendChild(queen);
        movePiece(-1, 3, queen.alt);

        let king = document.createElement('img');
        king.classList.add('piece');
        king.src = "sources/king-black.png";
        king.alt = "king-black";
        board[4].appendChild(king);
        movePiece(-1, 4, king.alt);

        //same as black pieces but in reverse
        for (let i = 63; i > 63-8; i -= 7) {
            let rook = document.createElement("img");
            rook.classList.add('piece');
            rook.src = "sources/rook-white.png";
            rook.alt = "rook-white";
            board[i].appendChild(rook);
            movePiece(-1, i, rook.alt);
        }
        for (let i = 62; i > 62-8; i -=5) {
            let knight = document.createElement("img");
            knight.classList.add('piece');
            knight.src = "sources/knight-white.png"
            knight.alt = "knight-white";
            board[i].appendChild(knight);
            movePiece(-1, i, knight.alt);
        }
        for (let i = 63-2; i > 63-8; i -= 3) {
            let bishop = document.createElement("img");
            bishop.classList.add('piece');
            bishop.src = "sources/bishop-white.png"
            bishop.alt = "bishop-white";
            board[i].appendChild(bishop);
            movePiece(-1, i, bishop.alt);
        }

        for (let i = 63-8; i > 63-16; i--) {
            let pawn = document.createElement('img');
            pawn.classList.add('piece');
            pawn.src = "sources/pawn-white.png";
            pawn.alt = "pawn-white";
            board[i].appendChild(pawn);
            movePiece(-1, i, pawn.alt);
        }

        let whitequeen = document.createElement('img');
        whitequeen.classList.add('piece');
        whitequeen.src = "sources/queen-white.png";
        whitequeen.alt = "queen-white";
        board[63-4].appendChild(whitequeen);
        movePiece(-1, 63-4, whitequeen.alt);

        let whiteking = document.createElement('img');
        whiteking.classList.add('piece');
        whiteking.src = "sources/king-white.png";
        whiteking.alt = "king-white";
        board[63-3].appendChild(whiteking);
        movePiece(-1, 63-3, whiteking.alt);
    }

    //TODO: add castling
    /**
     * If a tile is clicked will highlight potential moves, or
     * if highlighted tile is clicked moves previous clicked piece to tile.
     * or takes opponents piece on tile if opposing colors
     * @param {DOM Div} piece tile clicked on board
     * @param {Number} position position of piece clicked on board
     */
    function pieceClicked(piece, position) {
        console.log(position);
        console.log(piece);
        //moves piece if clicked a highlighted square
        if (piece.classList.contains('highlight')) {
            let board = id('board').children;
            let img = board[lastClickedPosition].children[0]; //last clicked piece

            //checks if it was certain colors turn to move
            if((isWhiteTurn && img.src.includes("black")) || (!isWhiteTurn && img.src.includes("white"))) {
                unhighlight(-1);
                return null;
            }

            let imgString = img.alt.toString(); //current piece that is moving
            let takenPiece = piece.children[0]; //piece that potentially could be taken
            if(takenPiece) { //if there is a piece that is taken i.e. it exists
                let takenString = takenPiece.src.toString();
                if ((takenString.includes('white') && imgString.includes('white')) ||
                (takenString.includes('black') && imgString.includes('black'))) { //if takEN is same as takING
                    unhighlight(-1);
                    return null;
                } else if ((takenString.includes('white') && imgString.includes('black')) ||
                (takenString.includes('black') && imgString.includes('white'))) { //if takEN is diff than takING
                    piece.innerHTML = ""; //remove taken piece
                    board[position].appendChild(img);
                    movePiece(lastClickedPosition, position, imgString);
                }
            } else { //if no taken piece then move successfully to position
                board[position].appendChild(img);
                movePiece(lastClickedPosition, position, imgString);
            }
            unhighlight(-1); //unhighlight entire board
            isWhiteTurn = !isWhiteTurn; //flip whos turn it is
        }
        else if(piece.children.length >= 1) { //if click contains a piece AND didnt already click a highlighted tile
            unhighlight(-1);
            lastClickedPosition = position;
            let pieceimg = piece.children[0]
            let pieceType = pieceimg.alt;
            //fetches all potential moves for clicked piece and highlights them
            fetch("/selectPiece?piece=" + pieceType + "&position=" + position)
              .then(data => data.json())
              .then(highlightMoves)
              .catch(err => console.log(err));
        }
    }

    /**
     * highlights board of possible moves based on given data from backend
     * @param {JSON} data JSON with array of possibles moves of clicked piece
     */
    function highlightMoves(data) {
        let board = id('board').children;
        let moves = data.moves;
        for (let i = 0; i < moves.length; i++) {
            let position = moves[i];
            let tile = board[position];
            tile.classList.toggle('highlight');
        }
    }

    /**
     * unhighlights specific positon, or if position == -1, unhighlights entire board
     * @param {Number} position position to unhighlight
     */
    function unhighlight(position) {
        let board = id('board').children;
        if(position == -1) { //unhighlight board
            for(let i = 0; i < board.length; i++) {
                if (board[i].classList.contains('highlight')) {
                    board[i].classList.toggle('highlight');
                }
            }
        } else { //unhighlight specific position
            board[position].classList.toggle('highlight');
        }
    }

    /**
     * takes pieces and POSTS piece to backend db
     * @param {Integer} prevPos no prev pos if -1
     * @param {Integer} newPos new position of piece
     * @param {String} name name of piece
     */
    function movePiece(prevPos, newPos, name){
        let data = new FormData();
        data.append("prevPos", prevPos);
        data.append("newPos", newPos);
        data.append("name", name);
        fetch("/movePiece", {method: "POST", body: data})
            .then(data => data.json())
            .then(data => console.log(data))
            .catch(err => console.log(err));
    }

  /**
   * returns the all objects under query of name
   * @param {String} name name of class/obj to request
   * @returns {Array} array of object that correlate to name
   */
  function qsa(name) {
    return document.querySelectorAll(name);
  }

  /**
   * Returns object with given id name
   * @param {String} name id name of wanted object
   * @returns {Object} DOM element that matches name
   */
  function id(name) {
    return document.getElementById(name);
  }

})();