(function ($) {

    let createDeckForm=$('#create-deck-form')
    let deckNameInput=$('#decknameInput')            
    let deckList=$('#deck-list')

    let createCardForm=$('#create-card-form')
    let cardFrontInput=$('#cardFrontInput')
    let cardBackInput=$('#cardBackInput')
    let cardList=$('#card-list')

    let editDeckForm=$('#edit-deck-form')
    let newDeckNameInput=$('#newDeckName')

    let errorDiv=document.getElementById('error')
    let errorDiv2=document.getElementById('error2') //error for submitting a bad deck name (renaming)
    
    //unsure if this is ever needed
    function bindEventsToDeckItem(deckItem) {
        deckItem.find('.submit-button').on('click',function (event) {
            //not really sure if this even runs
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
    }
    deckList.children().each(function (index, element) {
        bindEventsToDeckItem($(element))
    });
    //for creating a new card
    createCardForm.submit(function (event) {
        event.preventDefault();
        let newCardFront=cardFrontInput.val();
        let newCardBack=cardBackInput.val();
        if(newCardFront && newCardBack) {           //if the card front and back both have data (not empty)
            let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets deck id
            let requestConfig = {       //sets up request data and type to send
                method: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify({front:newCardFront,back:newCardBack})
            }
            $.ajax(requestConfig)./*sends that request*/then(function (responseMessage) {
                //these 3 come from the routes response(? (I think)). front and back are undefined if the input functions throw
                let id=responseMessage.id           //id is always here, since we are in a current deck
                let front=responseMessage.front
                let back=responseMessage.back
                //at this point, if the input is valid, the card was already added to the card list. This will just show it in the list without a refresh
                if(front && back) {         //if valid front and back data, add it to the list 
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="decks/${id}">${$('#cardFrontInput').val()} : ${$('#cardBackInput').val()}</a> </li>`
                    cardList.append(listItem)
                }
                else{           //if the card was not added (input functions threw), show the error, and focus on the form again
                    errorDiv.hidden=false
                    errorDiv.innerHTML=responseMessage.error
                    frmLabel=className='error'
                    cardFrontInput.focus();
                }
                $('#create-card-form').trigger('reset')         //reset the form regardless if card was added or not

            })
        }
    })
    //for creating a new deck
    createDeckForm.submit(function (event) {
        event.preventDefault();
        let newDeckName=deckNameInput.val();
        if(newDeckName) {           //if anytthing was put into the deck form (empty inputs do not work)
            let requestConfig = {       //sets up request data and type to send
                method: "POST",
                url: "/protected/decks",
                contentType: "application/json",
                data: JSON.stringify({name: newDeckName})
            }
            $.ajax(requestConfig)/*sends that request*/.then(function (responseMessage) {     
                let id=responseMessage.id        
                if(id) {   //id produced (createDeck passed)
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="decks/${id}">${$('#decknameInput').val()}</a> </li>`
                    deckList.append(listItem)       //if valid deck data, add it to the list
                }
                else{   //for when createDeck fails
                    errorDiv.hidden=false
                    errorDiv.innerHTML=responseMessage.error     //error message thrown from routes (checking) is used here
                    frmLabel=className='error'
                    deckNameInput.focus();
                }
                $('#create-deck-form').trigger('reset')     //reset the form regardless if it was added or not.
            })
        }
    })
    //for editing a deck name
    editDeckForm.submit(function (event) {
        let deckNewName=newDeckNameInput.val()          //gets data from the form where the user submits the new deck name
        if(deckNewName){
            let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets deck id
            let requestConfig={
                method: "PATCH",
                url: url,
                contentType: "application/json",
                data: JSON.stringify({name:deckNewName})
            }
            $.ajax(requestConfig)/*sends that request*/.then(function (responseMessage) {
                let id=responseMessage.id
                if(id){
                    errorDiv2.hidden=true
                    deckList.innerHTML=`<li> <a href="decks/${id}">${$('#newDeckName').val()}</a> </li>`
                }
                else{
                    errorDiv2.hidden=false
                    errorDiv2.innerHTML=responseMessage.error
                    frmLabel=className='error2'
                    newDeckNameInput.focus()
                }
                $('#edit-deck-form').trigger('reset')
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
                deckNameInput.focus();

            }
            $('#create-deck-form').trigger('reset')
        })

*/