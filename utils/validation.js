export const validateEmail = (email) => {
    const regextSt = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regextSt.test(email);
}


export const validateCreateProduct = (product, images) => {
    let sizes = product.sizes || [];
    let details = product.details || [];
    let questions = product.questions || [];

    const checks = [{
        msg: 'Name, Description, Brand added successfully.',
        type: "success"
    }];

    if(images.length < 1) {
        checks.push({
            msg: `Choose at least 1 image.`,
            type: "error"
        })
    } else {
        checks.push({
            msg: `At least one image selected.`,
            type: "success"
        })
    } 

    if (!product.color.image) {
        checks.push({
            msg: `Choose a main product style image.`,
            type: "error"
        })
    } else {
        checks.push({
            msg: `Product style image has been choosen.`,
            type: "success"
        })
    }

    const primaryStock = sizes[0] || {};
    if (primaryStock.qty === "" || primaryStock.qty === undefined || primaryStock.price === "" || primaryStock.price === undefined) {
        checks.push({
            msg: `Stock quantity and price are required.`,
            type: "error"
        });
    } else {
        checks.push({
            msg: `Stock information added.`,
            type: "success"
        });
    }

    if (product.productType === "subscription") {
        const hasIntervals = Array.isArray(product.subscriptionIntervals) && product.subscriptionIntervals.length > 0;
        const hasDeliveries = Array.isArray(product.subscriptionDeliveries) && product.subscriptionDeliveries.length > 0;
        if (!hasIntervals || !hasDeliveries) {
            checks.push({
                msg: `Please select subscription intervals and number of deliveries.`,
                type: "error"
            });
        }
    }

    if (product.productType === "booking" && product.bookingType === "date_time" && !product.bookingDuration) {
        checks.push({
            msg: `Please select booking duration for date and time reservations.`,
            type: "error"
        });
    }

    const detailsWithContent = details.filter((item) => item?.name || item?.value);
    for (let i = 0; i < detailsWithContent.length; i++ ) {
        if(detailsWithContent[i].name == "" || detailsWithContent[i].value == "" ) {
            checks.push({
                msg: `Please fill all information on details.`,
                type: "error"
            })
            break;
        } else {
            checks.push({
                msg: `Atleast one details added.`,
                type: "success"
            })
        }
    }
    const questionsWithContent = questions.filter((item) => item?.question || item?.answer);
    for (let i = 0; i < questionsWithContent.length; i++ ) {
        if(questionsWithContent[i].question == "" || questionsWithContent[i].answer == "" ) {
            checks.push({
                msg: `Please fill all information on questions.`,
                type: "error"
            })
            break;
        } else {
            checks.push({
                msg: `Atleast one question added.`,
                type: "success"
            })
        }
    }
    let s_test = checks.find((item) => item.type === "error");

    if(s_test) {
        return checks;
    } else {
        return "valid";
    }
}
