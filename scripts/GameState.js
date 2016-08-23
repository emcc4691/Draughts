function GameState() {
    this.counterPositions = [];

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

        if (!IsSquareEmpty(cellID)) {
            var isPlayer = $(cells[i]).find('.counter').attr('IsPlayer');
            var isKing = $(cells[i]).find('.counter').attr('IsKing');
            cellPositions.push(new Counter(cellID, isPlayer, isKing));
        }

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

GameState.prototype.getJumpedCounterID = function (fromID, toID) {
    var fromRow = parseInt(fromID.substring(1, 2));
    var fromColumn = parseInt(fromID.substring(0, 1));
    var toRow = parseInt(toID.substring(1, 2));
    var toColumn = parseInt(toID.substring(0, 1));

    if (Math.abs(fromRow - toRow) != 2 || Math.abs(fromColumn - toColumn) != 2)
        return;

    var middleRow = (fromRow + toRow) / 2;
    var middleColumn = (fromColumn + toColumn) / 2;

    var middleSquareID = middleColumn.toString() + middleRow.toString();
    var counter = this.findCounter(middleSquareID);

    if (!counter || counter.isPlayer == game.isPlayerTurn.toString())
        return;

    return middleSquareID;
}

GameState.prototype.isSquareSelectable = function (squareID) {
    var isActiveCounter = this.isSquareContainingActivePlayerCounter(squareID);

    if (!isActiveCounter)
        return false;

    var canMove = this.getPossibleSquaresToMoveTo(squareID).length > 0;

    return canMove;

}

GameState.prototype.isSquareEmpty = function (squareID) {
    return this.findCounter(squareID) == null;
}

GameState.prototype.findCounter = function (squareID) {
    var counters = this.counterPositions.filter(function (pos) { return pos.squareID == squareID; });

    if (counters.length < 1)
        return null;
    return counters[0];
}

GameState.prototype.isCounterKing = function (squareID) {
    var counter = this.findCounter(squareID);
    return counter.isKing;
}

GameState.prototype.isSquareContainingActivePlayerCounter = function (squareID) {
    var counter = this.findCounter(squareID);

    if (!counter) return false;

    return counter.isPlayer == game.isPlayerTurn.toString();
}

GameState.prototype.isSquareContainingActiveOpponentCounter = function (squareID) {
    var counter = this.findCounter(squareID);

    if (!counter) return false;

    return counter.isPlayer != game.isPlayerTurn.toString();
}

GameState.prototype.getImmediateEmptySurroundingSquares = function (squareID) {
    var squareIDs = [];
    var isCounterKing = this.isCounterKing(squareID);

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

GameState.prototype.getImmediatesSquaresToJumpTo = function (squareID) {
    var squareIDs = [];
    var isCounterKing = this.isCounterKing(squareID);

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

    possibleMoves = possibleMoves.concat(this.getImmediatesSquaresToJumpTo(squareID));

    if (possibleMoves.length > 0)
        return possibleMoves;

    possibleMoves = possibleMoves.concat(this.getImmediateEmptySurroundingSquares(squareID));

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

GameState.prototype.areAnyCountersAvailableToTake = function (squareID) {
    return this.getImmediatesSquaresToJumpTo(squareID).length > 0;
}

GameState.prototype.getPossibleSquaresThatCanTakeCounters = function () {
    var counters = this.counterPositions;
    var squares = [];

    for (var i = 0; i < counters.length; i++) {
        var element = counters[i];
        if (this.areAnyCountersAvailableToTake(element.cellID))
            squares.push(element);
    };
}


