using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTOs;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
namespace TaskManagementSystem.Modules.Statistics.Application.Services;


public class Analytics 
{
    private readonly TaskManagementDbContext context;

    public Analytics(TaskManagementDbContext context) {
        this.context = context;
    }

    public async Task<AnalyticsCardsDto> AnalyticsCardInformation(int userid) { 
    
        var DoneTasks = await context.
    }

}
