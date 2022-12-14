(function ($) {

    let newDeckForm=$('#create-deck-form')
    let newDeckNameInput=$('#decknameInput')
    let deckArea=$('#deck-area')

    function bindEventsToDeckItem(deckItem) {
        deckItem.find('.finishItem').on('click',function (event) {
            event.preventDefault();
            let currentLink=$(this)
            let currentId=currentLink.data('id')

            let requestConfig = {
                method: 'POST',
                url: '/protected/decks/'+currentId
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                let newElement=$(responseMessage);
                bindEventsToDeckItem(newElement)
                deckItem.replaceWith(newElement)
            })
        })
    }
    deckArea.children().each(function (index, element) {
        bindEventsToDeckItem($(element))
    })

    newDeckForm.submit(function (event) {
        event.preventDefault();

        let newDeckName=newDeckNameInput.val();
        
        if(newDeckName) {
            let useJSON=false
            if (useJSON) {
                let requestConfig = {
                    method: "POST",
                    url: '/protected/decks',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        name:newDeckName
                    })
                }
                $.ajax(requestConfig).then(function (responseMessage) {
                    console.log(responseMessage)
                    let newElement=$(responseMessage)
                    bindEventsToDeckItem(newElement)

                    deckArea.append(newElement)
                })
            }
        }
    })    
})(window.jQuery)