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

function DrawCounters(counters) {
    counters.forEach(function (counter) {
        counter.draw();
    });
}

function GetInitialCounters() {
    var counters = [];

    for (var i = 7; i > 4; i--) {
        var j = i % 2 == 0 ? 0 : 1;

        for (j; j < 8; j = j + 2) {
            var squareID = j.toString() + i.toString();
            counters.push(new Counter(squareID, isPlayer = true, isKing = false));
        }
    }

    for (var i = 0; i < 3; i++) {
        var j = i % 2 == 0 ? 0 : 1;

        for (j; j < 8; j = j + 2) {
            var squareID = j.toString() + i.toString();
            counters.push(new Counter(squareID, isPlayer = false, isKing = false));
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

    var counterTakers = state.getPossibleSquaresThatCanTakeCounters();

    if (counterTakers.length > 0) {
        counterTakers.forEach(function (element) {
            $('#' + element.squareID).addClass('selectable');
        });

        return;
    }

    for (var i = 0; i < squares.length; i++) {
        var element = squares[i];
        if (state.isSquareSelectable($(element).attr('id')))
            $(element).addClass('selectable');
    };
}

function SelectCounter(squareID) {
    $('.selected').removeClass('selected');
    $('.possibleMove').removeClass('possibleMove');

    var isCounterPlayer = $('#' + squareID).find('.counter').attr('isplayer') == "true";

    if (isCounterPlayer != game.isPlayerTurn) {
        RemoveClassesAndClickEvents();
        MarkSquareSelectable();
        AddSquareClickEvents();
        return;
    }

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

function MoveTo(event) {
    var fromID = $($('.selected')[0]).attr('id');
    var toID = $(GetSquare(event)).attr('id');
    var state = new GameState();
    var jumpedCounterID = state.getJumpedCounterID(fromID, toID);
    var hasJumpedCounter = jumpedCounterID != null;
    if (hasJumpedCounter) {
        $('#' + jumpedCounterID).find('.counter').remove();
    }

    if (!state.isValidMove(fromID, toID))
        return;

    MoveCounter(fromID, toID, hasJumpedCounter);
}

function MoveCounter(fromID, toID, hasJumpedCounter) {
    var counter = $('#' + fromID).find('.counter');

    Move(counter, fromID, toID, hasJumpedCounter);
}

function Move(element, fromID, toID, hasJumpedCounter) {
    var fromLeft = $('#' + fromID).position().left;
    var toLeft = $('#' + toID).position().left;
    var fromTop = $('#' + fromID).position().top;
    var toTop = $('#' + toID).position().top;

    var left = toLeft - fromLeft;
    var top = toTop - fromTop;

    var leftValue = '+=' + left + 'px';
    var topValue = '+=' + top + 'px';

    $(element).animate({ left: leftValue, top: topValue }, { duration: 'slow', complete: function () { ReplaceCounterCell(fromID, toID, hasJumpedCounter) } });
}

function ReplaceCounterCell(fromID, toID, hasJumpedCounter) {
    var isKing = $('td#' + fromID).find('.counter').attr('IsKing');
    $('td#' + fromID).find('.counter').remove();

    var counter = new Counter(toID, isPlayer = game.isPlayerTurn, isKing);
    counter.isKing = counter.shouldBeKing();

    counter.draw();
    Reset(toID, hasJumpedCounter);
}

function IsCounterToBecomeKing(toID) {

}

function Reset(squareMovedTo, hasJumpedCounter) {
    var isStillPlayerTurn = false;

    if (squareMovedTo != null && hasJumpedCounter) {
        isStillPlayerTurn = (new GameState()).areAnyCountersAvailableToTake(squareMovedTo);
    }

    game.isPlayerTurn = isStillPlayerTurn ? game.isPlayerTurn : !game.isPlayerTurn;

    RemoveClassesAndClickEvents();

    if (!isStillPlayerTurn) {
        MarkSquareSelectable(); // Only square possible to select is the one already moved.
        AddSquareClickEvents();
    }
    else {
        SelectCounter(squareMovedTo);
    }
}

function RemoveClassesAndClickEvents() {
    $('.selected').removeClass('selected');
    $('.selectable').removeClass('selectable');
    $('.possibleMove').removeClass('possibleMove');
    $('td').off('click', MoveTo);
    $('td').off('click', ClickSquare);
}

document.addEventListener('DOMContentLoaded', Initialise);