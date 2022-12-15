(function ($) {

    let newDeckForm=$('#create-deck-form')
    let newDeckNameInput=$('#decknameInput')
    let deckList=$('#deck-list')

    function bindEventsToDeckItem(deckItem) {
        //console.log("bindEventsToDeckItem")
        //let currentId="hello"
        deckItem.find('.submit-button').on('click',function (event) {
            event.preventDefault();
            console.log("clicked")
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
        //return currentId
    }
    let errorDiv=document.getElementById('error')
    deckList.children().each(function (index, element) {
        bindEventsToDeckItem($(element))
    });
    //for creating a new deck
    newDeckForm.submit(function (event) {
        event.preventDefault();
        let newDeckName=newDeckNameInput.val();
        if(newDeckName) {
            let requestConfig = {
                method: "POST",
                url: "/protected/decks",
                contentType: "application/json",
                data: JSON.stringify({name: newDeckName})
            }
            $.ajax(requestConfig).then(function (responseMessage) {     
                let id=responseMessage.id        
                if(id) {   //id produced (createDeck passed)
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="decks/${id}">${$('#decknameInput').val()}</a> </li>`
                    deckList.append(listItem)
                }
                else{   //for when createDeck fails
                    //let errorString=str.substring(str.indexOf('class="error" hidden>'))
                    errorDiv.hidden=false
                    errorDiv.innerHTML=responseMessage.error
                    frmLabel=className='error'
                    newDeckNameInput.focus();

                }
                $('#create-deck-form').trigger('reset')
            })
        }
    })    
})(window.jQuery)

/*
Old shitty string searching method:
    $.ajax(requestConfig).then(function (responseMessage) {     
                //searches the response (as a string) for the id
                let str=responseMessage.toString()
                let startInd=str.indexOf("<p hidden>id: ")+14;
                let endInd=str.indexOf(" \\\\\\</p>")
                let id=responseMessage.id              
                console.log("thingy: "+id)
                if(id.length>2) {   //id produced (createDeck passed)
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="decks/${id}">${$('#decknameInput').val()}</a> </li>`
                    deckList.append(listItem)
                }
                else{   //for when createDeck fails
                    console.log(str)
                    let errorString=str.substring(str.indexOf('class="error" hidden>'))
                    errorDiv.hidden=false
                    errorDiv.innerHTML="test"
                    frmLabel=className='error'
                    newDeckNameInput.focus();

                }
                $('#create-deck-form').trigger('reset')
            })

*/