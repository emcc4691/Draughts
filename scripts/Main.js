initialCoordinates = [];

function Initialise() {
    DrawTable();
    game = new Game();
    initialCoordinates = GetInitialCounters();
    DrawCounters(initialCoordinates);
    AddSquareClickEvents();
    MarkSquareSelectable();
}

function DrawTable() {
    for (var i = 0; i < 8; i++) {
        $('table').append('<tr id="row' + i.toString() + '"></tr>');

        for (var j = 0; j < 8; j++) {
            var color = GetSquareColor(i, j);
            $('tr#row' + i.toString()).append('<td id="' + j.toString() + i.toString() + '" class="' + color + '"></td>');
        }
    }
}

function GetSquareColor(row, column) {
    var isRowEven = row % 2 == 0;
    var isColumnEven = column % 2 == 0;

    return ((isRowEven && isColumnEven) || (!isRowEven && !isColumnEven)) ? 'black' : 'white';
}

function GetCounterImage(color) {
    return "images/counter-" + color + ".png";
}

function DrawCounters(coordinates) {
    coordinates.forEach(function (coord) {
        var squareID = coord.column.toString() + coord.row.toString();
        $('td#' + squareID).append('<img class="counter" isPlayer=' + coord.isPlayer + ' src="' + GetCounterImage(coord.isPlayer ? 'black' : 'white') + '" />');
    });
}

function GetInitialCounters() {
    var counters = [];

    for (var i = 7; i > 4; i--) {
        var j = i % 2 == 0 ? 1 : 0;

        for (j; j < 8; j = j + 2) {
            counters.push({ row: i, column: j, isPlayer: true });
        }
    }

    for (var i = 0; i < 3; i++) {
        var j = i % 2 == 0 ? 0 : 1;

        for (j; j < 8; j = j + 2) {
            counters.push({ row: i, column: j, isPlayer: false });
        }
    }

    return counters;
}

function AddSquareClickEvents() {
    $('td').on('click', function (e) {
        var element = e.target.classList.contains('counter') ? e.target.parentElement : e.target;
        if (!element.classList.contains('selectable'))
            return;
        SelectCounter($(element).attr('id'));
    })
}

function MarkSquareSelectable() {
    var squares = $('td');

    for (var i = 0; i < squares.length; i++) {
        var element = squares[i];
        if (IsSquareSelectable(element))
            $(element).addClass('selectable');
    };
}

function IsSquareSelectable(element) {
    return IsSquareContainingActivePlayerCounter($(element).attr('id'));
}

function SelectCounter(squareID) {
    $('.selected').removeClass('selected');
    $('.possibleMove').removeClass('possibleMove');

    $('#' + squareID).addClass('selected');

    GetPossibleSquaresToMoveTo(squareID).forEach(function (ID) {
        $('#' + ID).addClass('possibleMove');
    });
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

function IsSquareContainingActivePlayerCounter(squareID) {
    var counter = FindCounter(squareID);

    if (!counter) return false;

    return counter.attr('isPlayer') == game.isPlayerTurn.toString();
}

function IsSquareContainingActiveOpponentCounter(squareID) {
    var counter = FindCounter(squareID);

    if (!counter) return false;

    return counter.attr('isPlayer') == (!game.isPlayerTurn).toString();
}

function GetPossibleSquaresToMoveTo(squareID) {
    var possibleMoves = [];

    possibleMoves = possibleMoves.concat(GetImmediateEmptySurroundingSquares(squareID));
    possibleMoves = possibleMoves.concat(GetImmediatesSquaresToJumpTo(squareID));

    return possibleMoves;
}

function GetImmediateEmptySurroundingSquares(squareID) {
    var squareIDs = [];

    var topLeft = GetSquareID(squareID, -1, 1)
    if (topLeft && IsSquareEmpty(topLeft))
        squareIDs.push(topLeft);

    var topRight = GetSquareID(squareID, 1, 1)
    if (topRight && IsSquareEmpty(topRight))
        squareIDs.push(topRight);

    var bottomLeft = GetSquareID(squareID, -1, -1)
    if (bottomLeft && IsSquareEmpty(bottomLeft))
        squareIDs.push(bottomLeft);

    var bottomRight = GetSquareID(squareID, 1, -1)
    if (bottomRight && IsSquareEmpty(bottomRight))
        squareIDs.push(bottomRight);

    return squareIDs;
}

function GetImmediatesSquaresToJumpTo(squareID) {
    var squareIDs = [];

    var topLeft = GetSquareID(squareID, -1, 1);
    if (topLeft && IsSquareContainingActiveOpponentCounter(topLeft)) {
        var topTopLeftLeft = GetSquareID(topLeft, -1, 1);

        if (topTopLeftLeft && IsSquareEmpty(topTopLeftLeft))
            squareIDs.push(topTopLeftLeft);
    }

    var topRight = GetSquareID(squareID, 1, 1);
    if (topRight && IsSquareContainingActiveOpponentCounter(topRight)) {
        var topTopRightRight = GetSquareID(topRight, 1, 1);

        if (topTopRightRight && IsSquareEmpty(topTopRightRight))
            squareIDs.push(topTopRightRight);
    }

    var bottomLeft = GetSquareID(squareID, -1, -1);
    if (bottomLeft && IsSquareContainingActiveOpponentCounter(bottomLeft)) {
        var bottonBottomLeftLeft = GetSquareID(bottomLeft, -1, -1);

        if (bottonBottomLeftLeft && IsSquareEmpty(bottonBottomLeftLeft))
            squareIDs.push(bottonBottomLeftLeft);
    }

    var bottomRight = GetSquareID(squareID, 1, -1);
    if (bottomRight && IsSquareContainingActiveOpponentCounter(bottomRight))
        var bottonBottomRightRight = GetSquareID(bottomRight, 1, -1);

    if (bottonBottomRightRight && IsSquareEmpty(bottonBottomRightRight))
        squareIDs.push(bottonBottomRightRight);

    return squareIDs;
}

function GetSquareID(squareID, right, up) {
    var row = parseInt(squareID.substring(1, 2));
    var column = parseInt(squareID.substring(0, 1));

    if (column + right > 7 || column + right < 0 || row - up < 0 || row - up > 7)
        return null;

    var newRow = row - up;
    var newColumn = column + right;

    return newColumn.toString() + newRow.toString();
}

function MoveCounter(fromID, toID) {
    if (!IsSquareSelectable(fromID) || !GetPossibleSquaresToMoveTo(fromID).contains(toID))
        return;

    var fromLeft = $('#' + fromID).position().left;
    var toLeft = $('#' + toID).position().left;
    var fromTop = $('#' + fromID).position().top;
    var toTop = $('#' + toID).position().top;

    var counter = $('#' + fromID).find('.counter');

    Move(counter, toTop - fromTop, toLeft - fromLeft);
}

function Move(element, top, left) {
    var leftValue = '+=' + left + 'px';
    var topValue = '+=' + top + 'px';
    $(element).animate({ left: leftValue, top: topValue }, 'slow');
}

document.addEventListener('DOMContentLoaded', Initialise);