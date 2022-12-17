(function ($) {
    //creating and adding a deck
    let createDeckForm=$('#create-deck-form')
    let deckNameInput=$('#decknameInput')
    let deckSubjectInput=$('#decksubjectInput')
    let deckList=$('#deck-list')
    //creating and adding cards
    let createCardForm=$('#create-card-form')
    let cardFrontInput=$('#cardFrontInput')
    let cardBackInput=$('#cardBackInput')
    let cardList=$('#card-list')
    //editing cards
    let editCardForm=$('#edit-card-form')
    let newCardFrontInput=$('#newCardFrontInput')
    let newCardBackInput=$('#newCardBackInput')
    //deleting cards
    let deleteCardButton=$('#delete-card')
    //editing deck names
    let editDeckForm=$('#edit-deck-form')
    let newDeckNameInput=$('#newDeckName')
    //editing deck subjects
    let newDeckSubjectInput=$('#newDeckSubject')
    //deck publicity
    let newDeckPublicity=$('#isDeckPublic')
    //deleting decks
    let deleteDeckButton=$('#delete-deck')
    //errors
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
            let url=window.location.href.substring(window.location.href.indexOf("/protected/decks"));     //gets deck id
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
                if(responseMessage.success) {         //if valid front and back data, add it to the list 
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="${url}/cards/${front}">${front} : ${back}</a> </li>`
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
    //for editing a card
    editCardForm.submit(function (event) {
        event.preventDefault();
        let cardNewFront=newCardFrontInput.val()
        let cardNewBack=newCardBackInput.val()
        if(cardNewFront && cardNewBack){        //if new inputs were specified
            let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets complete url
            let requestConfig={
                method:"PATCH",
                url:url,
                contentType:"application/json",
                data: JSON.stringify({front:cardNewFront,back:cardNewBack})
            }
            $.ajax(requestConfig).then(function (responseMessage) {
                let newFront=responseMessage.cardFront
                let newBack=responseMessage.cardBack
                let errorDiv=document.getElementById('error3')
                if(responseMessage.success){
                    errorDiv.hidden=true
                    $('#card-front-h1').replaceWith(`<h1 id="card-front-h1" class="card-front-h1">${newFront}</h1>`)
                    $('#card-back-h2').replaceWith(`<h2 id="card-back-h2" class="card-back-h2">${newBack}</h2>`)
                    window.location.href=url.substring(0,url.indexOf('/cards'))
                }
                else{
                    errorDiv.hidden=false
                    errorDiv.innerHTML=responseMessage.errorMessage     //error message thrown from routes (checking) is used here
                    frmLabel=className='error3'
                    newCardFrontInput.focus();
                }
                $('#edit-card-form').trigger('reset')
            })
        }
    })
    //for deleting a card
    deleteCardButton.on('click', function (event) {
        event.preventDefault();
        let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets card url
        let card=url.substring(url.indexOf("/cards/")+7)
        let redirectUrl=url.substring(0,url.indexOf('/cards'))
        let requestConfig = {
            method: "DELETE",
            url:url,
            contentType:"application/json",
            data: JSON.stringify({front:card})
        }
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.success){
                alert("Card successfully deleted")
                window.location.href=redirectUrl
            }
            else{
                alert(responseMessage.error)
            }
        })
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
                data: JSON.stringify({name: newDeckName, subject: deckSubjectInput.val()})
            }
            $.ajax(requestConfig)/*sends that request*/.then(function (responseMessage) {     
                let id=responseMessage.id        
                if(responseMessage.success) {   //id produced (createDeck passed)
                    errorDiv.hidden=true
                    const listItem = `<li> <a href="decks/${id}">${deckNameInput.val()}</a> - Subject: ${deckSubjectInput.val()} </li>`
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
    //for editing a deck name and subject and publicity
    editDeckForm.submit(function (event) {
        event.preventDefault();
        let deckNewName=newDeckNameInput.val()          //gets data from the form where the user submits the new deck name
        let deckNewSubject=newDeckSubjectInput.val()
        let deckNewPublicity=newDeckPublicity.is(":checked")
        
        if(deckNewName && deckNewSubject){            //if new deck name was accepted
            let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets deck url
            let requestConfig={
                method: "PATCH",
                url: url,
                contentType: "application/json",
                data: JSON.stringify({name:deckNewName,subject:deckNewSubject,public:deckNewPublicity})
            }
            $.ajax(requestConfig)/*sends that request*/.then(function (responseMessage) {
                //console.log(responseMessage)
                if(responseMessage.success){
                    errorDiv2.hidden=true
                    $('#deckName').replaceWith(`<h1 id="deckName" class="deckName">${deckNewName}</h1>`)   //updates deck name at top of page
                    $('#deckSubject').replaceWith(`<h2 id="deckSubject" class="deckSubject">${deckNewSubject}</h2>`)
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
    //for deleting a deck
    deleteDeckButton.on('click', function (event) {
        event.preventDefault();
        let url=window.location.href.substring(window.location.href.indexOf("/protected"));     //gets deck id
        let id=url.substring(url.indexOf("/decks/")+7)
        let requestConfig = {
            method: "DELETE",
            url: url,
            contentType:"application/json",
            data: JSON.stringify({id:id})
        }
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.success){
                alert("Deck successfully deleted")
                window.location.href='/protected/decks'
            }
            else{
                alert(responseMessage.error)
            }
        })
    })
})(window.jQuery)