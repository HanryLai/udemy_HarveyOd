const strs = ['adflower', 'cqflow', 'scflight'];

function longestCommonPrefix(strs) {
   if (!strs.length) return '';
   let prefix = strs[0];
   let subChar = 0;
   for (let i = 1; i < strs.length; i++) {
      while (strs[i].indexOf(prefix) === -1) {
         // condition : common end char
         let checkCommonLocation = checkEndCharactor(
            prefix.charAt(prefix.length - 1),
            strs[i].charAt(prefix.length - 1 + subChar),
         );
         if (checkCommonLocation) {
            subChar++;

            prefix = prefix.substring(1, prefix.length);
         } else {
            prefix = prefix.substring(0, prefix.length - 1);
         }
         // condition : common start char

         if (!prefix) return '';
      }
   }

   return prefix;
}

function checkEndCharactor(prefixEnd, elementEnd) {
   console.log(`prefix: ${prefixEnd} \n 
        elementEnd: ${elementEnd}`);
   return prefixEnd === elementEnd;
}

console.log('result:' + longestCommonPrefix(strs));

console.log('sdf'.indexOf('v'));
