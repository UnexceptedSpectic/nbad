function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

exports.removeAllChildNodes = removeAllChildNodes;
