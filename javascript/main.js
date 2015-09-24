var allData = [];

$(document).on('click', '.login-button', function(event) {
    IN.User.authorize(function() {});
});

//logout of linkedin
$(document).on('click', '.logout-button', function(event) {
    IN.User.logout(function() {
        window.location = "";
    });
});

//its called by the javascript linkedin script
linkedIn = function() {
    IN.Event.on(IN, "auth", getProfileData);

    $('.login-cont').append('<p>Hello</p>' +
        '<button class="btn btn-5 btn-5a icon-linkedin login-button"><span>Sign in with LinkedIn</span></button>');
}

//once we are authorised we start extracting data
getProfileData = function() {
    $('.login-cont').css('display', 'none');

    allData = [];

    IN.API.Raw('people/~:(id,num-connections,picture-url)').result(function(extra) {
        $('.photo').append('<img src="' + extra.pictureUrl + '"/>');
        $('.connections').html(extra.numConnections + ' connections');
        $('.actions-bar').append('<a href="#"class="under-buttons export-button">Export to CSV </a>' +
            ' - ' +
            '<span class="under-buttons logout-button"> Logout</span>');
        //gather data for the csv export
        allData.push({
            Connections: extra.numConnections
        }, {
            ImageURl: extra.pictureUrl
        });
    });


    IN.API.Raw('people/~').result(function(basic) {
        $('.full-name').html(basic.firstName + ' ' + basic.lastName);
        $('.job-title').html(basic.headline);

        //gather data for the csv export
        allData.push({
            FirstName: basic.firstName
        }, {
            LastName: basic.lastName
        }, {
            Headline: basic.headline
        });
    });

    IN.API.Raw('companies?format=json&is-company-admin=true').result(function(companies) {
        $('.profile-card').fadeIn();

        if (companies.hasOwnProperty('values')) {

            $.each(companies.values, function(k, v) {
                IN.API.Raw('companies/' + v.id + ':(id,name,ticker,description)?format=json').result(function(company) {
                    $('.companies').append('<p class="company-name">' + company.name + '</p>');
                    if (company.description !== undefined) {
                        $('.companies').append('<p class="company-description">' + company.description + '</p>');
                    } else
                        $('.companies').append('<p class="company-description">No description available.</p>');
                    //gather data for the csv export
                    allData.push({
                        CompanyDescription: company.name,
                        CompanyName: company.description
                    });
                });
            })

        } else {
            $('.admin-title').hide();
            $('.companies').hide();

        }
        exportData();
    });

    //send the data to the php file for manipulation
    exportData = function() {
        $.ajax({
            type: 'POST',
            url: 'export_data.php',
            data: {
                postname: JSON.stringify(allData)
            },
            success: function(response) {
                exportTableToCSV(response, 'export.csv');
                
            }
        });
    };

}

function exportTableToCSV(csv, filename) {
    // Data URI
    var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
    //append download link to the button
    $(".export-button")
        .attr({
            'download': filename,
            'href': csvData,
            'target': '_blank'
        });

}
