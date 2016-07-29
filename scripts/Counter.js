function Counter(squareID, isPlayer, isKing) {
    this.squareID = squareID;
    this.isPlayer = isPlayer;
    this.isKing = isKing;
}

Counter.prototype.MakeCounterKing = function () {
    var kingCounter = new Counter(this.squareID, this.isPlayer, isKing = true);
    $(this).remove();
    DrawCounter(kingCounter);
}

Counter.prototype.draw = function () {
    $('td#' + this.squareID).append('<img class="counter" isPlayer=' + this.isPlayer + ' src="' + this.getImage() + '" />');
}

Counter.prototype.getImage = function () {
    return "images/counter-" + (this.isPlayer ? 'white' : 'black') + (this.isKing ? '-king' : '') + ".png";
}