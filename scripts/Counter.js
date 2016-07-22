function Counter(row, column, isPlayer, isKing) {
    this.row = row;
    this.column = column;
    this.isPlayer = isPlayer;
    this.isKing = isKing;
}

Counter.prototype.MakeCounterKing = function (counterSquareID) {
    var kingCounter = new Counter(this.row, this.column, this.isPlayer, isKing = true);
    $(this).remove();
    DrawCounter(kingCounter);
}