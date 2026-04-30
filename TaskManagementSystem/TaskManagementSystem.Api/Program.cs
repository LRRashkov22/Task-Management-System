using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Identity.Configuration;
using TaskManagementSystem.Data.Configuration;
var builder = WebApplication.CreateBuilder(args);

//builder.Services.AddControllers()
//    .AddApplicationPart(
//        typeof(TaskManagementSystem.Modules.Identity.Presentation.IdentityController).Assembly);
//builder.Services.AddOpenApi();    

//Adding Modules (Controllers And DI)-------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddIdentityModule();
//------------------------------------------------------------------------------------

builder.Services.AddData(builder.Configuration);

//builder.Services.AddDbContext<TMSDbContext>(options =>
//    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//JWT Authentication configuration-----------------------------------------------------

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!))
        };
    });

//--------------------------------------------------------------------------------------

var app = builder.Build();


//using (var scope = app.Services.CreateScope())
//{
//    var context = scope.ServiceProvider.GetRequiredService<TMSDbContext>();

//    if (!context.Users.Any(u => u.Role == "Admin"))
//    {
//        var admin = new User
//        {
//            Username = "adi",
//            Role = "Admin"
//        };

//        admin.PasswordHash = new PasswordHasher<User>()
//            .HashPassword(admin, "adi");

//        context.Users.Add(admin);
//        context.SaveChanges();
//    }
//}


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();


app.Run();
