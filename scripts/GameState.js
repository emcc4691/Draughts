function GameState() {
    var counterPositions = [];

    this.initialise();
}

GameState.prototype.initialise = function () {
    this.counterPositions = GetCounters();
}

function GetCounters() {
    var cells = $('td');

    var cellPositions = [];

    for (var i = 0; i < cells.length; i++) {
        var cellID = $(cells[i]).attr('id');

        if (!IsSquareEmpty(cellID))
            cellPositions.push({ ID: cellID, IsPlayer: $(cells[i]).find('.counter').attr('IsPlayer') });
    }

    return cellPositions;
}

function FindCounter(squareID) {
    var counters = $('#' + squareID).find('.counter');

    if (counters.length >= 1)
        return $(counters[0]);
    return null;
}

function IsSquareEmpty(squareID) {
    return FindCounter(squareID) == null;
}


GameState.prototype.isSquareSelectable = function (squareID) {
    return this.isSquareContainingActivePlayerCounter(squareID);
}

GameState.prototype.isSquareEmpty = function (squareID) {
    return this.findCounter(squareID) == null;
}

GameState.prototype.findCounter = function (squareID) {
    var counters = this.counterPositions.filter(function (pos) { return pos.ID == squareID; });

    if (counters.length < 1)
        return null;
    return counters[0];
}

GameState.prototype.isSquareContainingActivePlayerCounter = function (squareID) {
    var counter = this.findCounter(squareID);

    if (!counter) return false;

    return counter.IsPlayer == game.isPlayerTurn.toString();
}

GameState.prototype.isSquareContainingActiveOpponentCounter = function (squareID) {
    var counter = this.findCounter(squareID);

    if (!counter) return false;

    return counter.IsPlayer != game.isPlayerTurn.toString();
}



GameState.prototype.getImmediateEmptySurroundingSquares = function (squareID, isCounterKing) {
    var squareIDs = [];

    if (game.isPlayerTurn || isCounterKing) {
        var topLeft = GetSquareID(squareID, -1, 1)
        if (topLeft && this.isSquareEmpty(topLeft))
            squareIDs.push(topLeft);

        var topRight = GetSquareID(squareID, 1, 1)
        if (topRight && this.isSquareEmpty(topRight))
            squareIDs.push(topRight);
    }


    if (!game.isPlayerTurn || isCounterKing) {
        var bottomLeft = GetSquareID(squareID, -1, -1)
        if (bottomLeft && this.isSquareEmpty(bottomLeft))
            squareIDs.push(bottomLeft);

        var bottomRight = GetSquareID(squareID, 1, -1)
        if (bottomRight && this.isSquareEmpty(bottomRight))
            squareIDs.push(bottomRight);
    }

    return squareIDs;
}

GameState.prototype.getImmediatesSquaresToJumpTo = function (squareID, isCounterKing) {
    var squareIDs = [];

    if (game.isPlayerTurn || isCounterKing) {
        var topLeft = GetSquareID(squareID, -1, 1);
        if (topLeft && this.isSquareContainingActiveOpponentCounter(topLeft)) {
            var topTopLeftLeft = GetSquareID(topLeft, -1, 1);

            if (topTopLeftLeft && this.isSquareEmpty(topTopLeftLeft))
                squareIDs.push(topTopLeftLeft);
        }

        var topRight = GetSquareID(squareID, 1, 1);
        if (topRight && this.isSquareContainingActiveOpponentCounter(topRight)) {
            var topTopRightRight = GetSquareID(topRight, 1, 1);

            if (topTopRightRight && this.isSquareEmpty(topTopRightRight))
                squareIDs.push(topTopRightRight);
        }
    }

    if (!game.isPlayerTurn || isCounterKing) {
        var bottomLeft = GetSquareID(squareID, -1, -1);
        if (bottomLeft && this.isSquareContainingActiveOpponentCounter(bottomLeft)) {
            var bottonBottomLeftLeft = GetSquareID(bottomLeft, -1, -1);

            if (bottonBottomLeftLeft && this.isSquareEmpty(bottonBottomLeftLeft))
                squareIDs.push(bottonBottomLeftLeft);
        }

        var bottomRight = GetSquareID(squareID, 1, -1);
        if (bottomRight && this.isSquareContainingActiveOpponentCounter(bottomRight))
            var bottonBottomRightRight = GetSquareID(bottomRight, 1, -1);

        if (bottonBottomRightRight && this.isSquareEmpty(bottonBottomRightRight))
            squareIDs.push(bottonBottomRightRight);
    }

    return squareIDs;
}

GameState.prototype.getPossibleSquaresToMoveTo = function (squareID) {
    var possibleMoves = [];
    var isCounterKing = $(this.findCounter(squareID)).attr('IsKing') == "true";

    possibleMoves = possibleMoves.concat(this.getImmediateEmptySurroundingSquares(squareID, isCounterKing));
    possibleMoves = possibleMoves.concat(this.getImmediatesSquaresToJumpTo(squareID, isCounterKing));

    return possibleMoves;
}

GameState.prototype.isValidMove = function (from, to) {
    if (!this.isSquareSelectable(from)) return false;

    var moves = this.getPossibleSquaresToMoveTo(from);

    for (var i = 0; i < moves.length; i++) {
        if (moves[i] == to)
            return true;
    }
    return false;
}




