package com.financemanager.listener.network

import com.financemanager.listener.BuildConfig
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/v1/transactions/sync/batch")
    suspend fun syncBatch(@Body requests: List<TransactionSyncDto>): Response<Any>
}

object ApiClient {
    private val BASE_URL: String = if (BuildConfig.BASE_URL.endsWith("/")) BuildConfig.BASE_URL else "${BuildConfig.BASE_URL}/"

    val service: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}