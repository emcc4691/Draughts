initialCoordinates = [];

function Initialise() {
    DrawTable();
    game = new Game();
    initialCoordinates = GetInitialCounters();
    DrawCounters(initialCoordinates);
    Reset();
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
        DrawCounter(coord);
    });
}

function DrawCounter(coord) {
    var squareID = coord.column.toString() + coord.row.toString();
    $('td#' + squareID).append('<img class="counter" isPlayer=' + coord.isPlayer + ' src="' + GetCounterImage(coord.isPlayer ? 'black' : 'white') + '" />');
}

function GetInitialCounters() {
    var counters = [];

    for (var i = 7; i > 4; i--) {
        var j = i % 2 == 0 ? 0 : 1;

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
    $('td').on('click', ClickSquare);
}

function ClickSquare(event) {
    var square = GetSquare(event);
    if (!square.classList.contains('selectable'))
        return;
    SelectCounter($(square).attr('id'));
}

function GetSquare(event) {
    return event.target.classList.contains('counter') ? event.target.parentElement : event.target;
}

function MarkSquareSelectable() {
    $('.selectable').removeClass('selectable');

    var squares = $('td');

    var state = new GameState();

    for (var i = 0; i < squares.length; i++) {
        var element = squares[i];
        if (state.isSquareSelectable($(element).attr('id')))
            $(element).addClass('selectable');
    };
}

function SelectCounter(squareID) {
    $('.selected').removeClass('selected');
    $('.possibleMove').removeClass('possibleMove');

    $('#' + squareID).addClass('selected');
    var state = new GameState();

    state.getPossibleSquaresToMoveTo(squareID).forEach(function (ID) {
        $('#' + ID).addClass('possibleMove');
    });

    $('.possibleMove').off('click', ClickSquare);
    $('.possibleMove').on('click', MoveTo);
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
    var state = new GameState();

    if (!state.isValidMove(fromID, toID))
        return;

    var counter = $('#' + fromID).find('.counter');

    Move(counter, fromID, toID);
}

function MoveTo(event) {
    var fromID = $($('.selected')[0]).attr('id');
    var toID = $(GetSquare(event)).attr('id');
    MoveCounter(fromID, toID);

    Reset();
}

function Reset() {
    // TODO - update game state

    $('.selected').removeClass('selected');
    $('.possibleMove').removeClass('possibleMove');
    $('td').off('click', MoveTo);
    $('td').off('click', ClickSquare);
    MarkSquareSelectable();
    AddSquareClickEvents();
}

function Move(element, fromID, toID) {
    var fromLeft = $('#' + fromID).position().left;
    var toLeft = $('#' + toID).position().left;
    var fromTop = $('#' + fromID).position().top;
    var toTop = $('#' + toID).position().top;

    var left = toLeft - fromLeft;
    var top = toTop - fromTop;

    var leftValue = '+=' + left + 'px';
    var topValue = '+=' + top + 'px';

    $(element).animate({ left: leftValue, top: topValue }, { duration: 'slow', complete: function () { ReplaceCounterCell(fromID, toID); } });
}

function ReplaceCounterCell(fromID, toID) {
    $('td#' + fromID).find('.counter').remove();
    DrawCounter({ row: parseInt(toID.substring(1, 2)), column: parseInt(toID.substring(0, 1)), isPlayer: game.isPlayerTurn });
}

document.addEventListener('DOMContentLoaded', Initialise);