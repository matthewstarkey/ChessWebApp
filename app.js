"use strict";
//const sq3 = require('sqlite3');
const sq = require('sqlite');
const sq3 = require('sqlite3');
const express = require('express');
const app = express();
const multer = require('multer');

const PORT_CODE = 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_CODE;
app.listen(PORT, () => console.log("listening @ "+ PORT ));

const edgeLeft = [0,8,16,24,32,40,48,56];
const edgeRight = [7,15,23,31,39,47,55,63];

initilizeDB(); //this sets every element to empty to start a new game

/**
 *
 */
app.get("/selectPiece", async function(req, res) {
    let piece = req.query.piece;
    let position = req.query.position;
    let possibleMoves = [];
    position = parseInt(position);

    //TODO: Check if moving piece will place you in check (if theres a pin on king)
    //TODO:

    //separate pawn to color bc movement depends on colored piece
    if(piece == "pawn-white") { //rules for pawn, white
        let piece1Pos = position - 9;
        let piece2Pos = position - 7;
        if (await doesPieceExist(piece1Pos)) { //diagnol attacks
            possibleMoves.push(piece1Pos);
        }
        if (await doesPieceExist(piece2Pos)) {
            possibleMoves.push(piece2Pos);
        }

        if(position >= 48 && position <= 55) { //if piece hasnt moved
            possibleMoves.push(position-8);
            possibleMoves.push(position-16);
        } else {
            possibleMoves.push(position-8);
        }
    }
    if (piece == "pawn-black") { //rules for pawn, black
        let piece1Pos = position + 9;
        let piece2Pos = position + 7;
        if (await doesPieceExist(piece1Pos)) { //diagnol attacks
            possibleMoves.push(piece1Pos);
        }
        if (await doesPieceExist(piece2Pos)) {
            possibleMoves.push(piece2Pos);
        }
        if(position >= 8 && position <= 15) { //if piece hasnt moved
            possibleMoves.push(position+8);
            possibleMoves.push(position+16);
        } else {
            possibleMoves.push(position+8);
        }
    }

    if (piece.includes("knight")) {
        if (containsEdgeLeft(position)) { //if on left edge
            let back = position - 15;
            let front = position + 17;
            if (back >= 0) {
                possibleMoves.push(back);
            }
            if (front <= 63) {
                possibleMoves.push(front);
            }
        } else if (containsEdgeRight(position)) { //if on right edge
            let back = position - 17;
            let front = postion + 15;
            if (back >= 0) {
                possibleMoves.push(back);
            }
            if (front <= 63) {
                possibleMoves.push(front);
            }
        } else {
            //moves if not on an edge
            let firstBack = position-17;
            let secondBack = position-15;
            let firstFront = position+15;
            let secondFront = position+17;
            //if moves don't leave the border of the board [0-63]
            if (firstBack >= 0 && firstBack <= 63) {
                possibleMoves.push(firstBack);
            }
            if (secondBack >= 0 && secondBack <= 63) {
            possibleMoves.push(secondBack);
            }
            if (firstFront >= 0 && firstFront <= 63) {
                possibleMoves.push(firstFront);
            }
            if (secondFront >= 0 && secondFront <= 63) {
                possibleMoves.push(secondFront);
            }
        }
    }

    if (piece.includes("bishop")) {
        //back-left
        for (let i = position; i >= 0; i -= 9) {
            possibleMoves.push(i);
            //if hits wall or if hits piece (for all ifs)
            if (containsEdgeLeft(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //front-left
        for (let i = position; i <= 63; i += 7) {
            possibleMoves.push(i);
            if (containsEdgeLeft(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //back-right
        for (let i = position; i >= 0; i -= 7) {
            possibleMoves.push(i);
            if (containsEdgeRight(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //front-right
        for (let i = position; i <= 63; i += 9) {
            possibleMoves.push(i);
            if (containsEdgeRight(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
    }

    if (piece.includes("rook")) {
        //right motion
        let j = position+1;
        //move possible positions until hits piece or wall
        while (!containsEdgeRight(j) && await !doesPieceExist(j)) {
            possibleMoves.push(j);
            j += 1;
        }
        //fencepost one out (the edge position)
        possibleMoves.push(j);

        //left motion
        let i = position-1;
        while (!containsEdgeLeft(i) && await !doesPieceExist(i)) {
            possibleMoves.push(i);
            i -= 1;
        }
        //fencepost one out (the edge position)
        possibleMoves.push(i);

        //front motion
        for (let i = position + 8; i <= 63; i += 8) {
            possibleMoves.push(i);
            if(await doesPieceExist(i)) {
                break;
            }
        }
        //back motion
        for (let i = position - 8; i >= 0; i -= 8) {
            possibleMoves.push(i);
            if(await doesPieceExist(i)) {
                break;
            }
        }
    }

    if (piece.includes("queen")) {

        //ROOK BEHAVIOR
        //right motion
        let j = position+1;
        //move possible positions until hits piece or wall
        while (!containsEdgeRight(j) && await !doesPieceExist(j)) {
            possibleMoves.push(j);
            j += 1;
        }
        //fencepost one out (the edge position)
        possibleMoves.push(j);

        //left motion
        let i = position-1;
        while (!containsEdgeLeft(i) && await !doesPieceExist(i)) {
            possibleMoves.push(i);
            i -= 1;
        }
        //fencepost one out (the edge position)
        possibleMoves.push(i);

        //front motion
        for (let i = position + 8; i <= 63; i += 8) {
            possibleMoves.push(i);
            if(await doesPieceExist(i)) {
                break;
            }
        }
        //back motion
        for (let i = position - 8; i >= 0; i -= 8) {
            possibleMoves.push(i);
            if(await doesPieceExist(i)) {
                break;
            }
        }

        //BISHOP BEHAVIOR
        //back-left
        for (let i = position; i >= 0; i -= 9) {
            possibleMoves.push(i);
            //if hits wall or if hits piece (for all ifs)
            if (containsEdgeLeft(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //front-left
        for (let i = position; i <= 63; i += 7) {
            possibleMoves.push(i);
            if (containsEdgeLeft(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //back-right
        for (let i = position; i >= 0; i -= 7) {
            possibleMoves.push(i);
            if (containsEdgeRight(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
        //front-right
        for (let i = position; i <= 63; i += 9) {
            possibleMoves.push(i);
            if (containsEdgeRight(i)) {
                break;
            } else if (i != position && await doesPieceExist(i)) {
                break;
            }
        }
    }

    if (piece.includes("king")) {
        if (containsEdgeLeft(position))  {
            possibleMoves.push(position-7);
            possibleMoves.push(position-8);
            possibleMoves.push(position+1);
            possibleMoves.push(position+8);
            possibleMoves.push(position+9);
        } else if (containsEdgeRight(position)) {
            possibleMoves.push(position-8);
            possibleMoves.push(position-9);
            possibleMoves.push(position-1);
            possibleMoves.push(position+7);
            possibleMoves.push(position+8);
        } else { //if not in back row
            possibleMoves.push(position-1);
            possibleMoves.push(position+1);
            if (position > 7) {
                possibleMoves.push(position-7);
                possibleMoves.push(position-8);
                possibleMoves.push(position-9);
            }
            if (position < 56) { //if not in front row
                possibleMoves.push(position+7);
                possibleMoves.push(position+8);
                possibleMoves.push(position+9);
            }
        }

    }
    res.json({"moves": possibleMoves});
});


/**
 * Moves piece selected from prev to new position
 * POST request takes prev position, new position, and name of piece as body
 * Returns {success} JSON if piece moved successfully
 */
app.post("/movePiece", async function(req, res){
    let prevPos = parseInt(req.body.prevPos);
    let newPos = parseInt(req.body.newPos);
    let name = req.body.name;
    try {
        let db = await getDBConnection();
        let postQRY = "UPDATE gamestate SET piece=? WHERE position=?";
        if(prevPos != -1) {
            await db.run(postQRY, ["empty", prevPos]);
        }
        await db.run(postQRY, [name, newPos]);
        await db.close();
        res.json({"success": name + " successfully moved to " + newPos});
    } catch (err) {
        console.log(err);
        res.json({"error": "There was an error connecting to the server database"});
    }
});

/**
 * Initilizes database by creating every entry of the position gamestate as "empty"
 * The client will tell the backend where the initial pieces go afterwards.
 * Yes... it would probably be faster to do that in this function shut up.
 */
async function initilizeDB() {
    try {
        let db = await getDBConnection();
        let QRY = "UPDATE gamestate SET piece=? WHERE position=?";
        for(let i = 0; i < 64; i++){
            await db.run(QRY, ["empty", i]);
        }
        await db.close();
    } catch (err) {
        console.log(err);
        console.log("There was an error initializing Database")
    }
}

/**
 * Checks if there is a piece in the current position. returns Boolean
 * @param {Integer} position to check if piece exists here
 * @returns {Boolean} if piece exists in location.
 */
async function doesPieceExist(position) {
    try {
        let db = await getDBConnection();
        let qry = "SELECT piece FROM gamestate WHERE position=?";
        let piece = await db.all(qry, [position]);
        await db.close();
        return !piece[0].piece.includes("empty");
    } catch {
        console.log("There was an error w/ DB");
    }
}

/**
 * Checks if position is on edge of board (for special cases of piece motion)
 * @param {Interger} position postition of piece clicked
 */
function containsEdgeLeft(position) {
    for (let i = 0; i < edgeLeft.length; i++) {
        if(position == edgeLeft[i]) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if position is on edge of board (for special cases of piece motion)
 * @param {Interger} position position of piece clicked
 */
function containsEdgeRight(position) {
    for (let i = 0; i < edgeRight.length; i++) {
        if(position == edgeRight[i]) {
            return true;
        }
    }
    return false;
}

/**
 * Establishes a connection to database storing all game and user data
 * All errors should be caught by the function calling this one.
 * @returns {Object} The database object from the established connections
 */
async function getDBConnection() {
    const db = await sq.open({
      filename: 'pieces.db',
      driver: sq3.Database
    });
    return db;
  }